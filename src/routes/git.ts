//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { accessSync, constants } from "fs";
import { Server, containers, log } from "@/main";
import Container, { ExitCode } from "@/docker/container";

interface Config {
	enabled: boolean;
	timeout: number;
}

interface Body {
	gitURL: string;
	branch: string;
	commit: string;
}

//=============================================================================

/**
 * Construct a container to run the code in.
 * @param project The project to run the code in.
 * @param request The request to get the code from.
 * @returns The container object.
 */
export function payload(project: string, request: Body, config: Config) {
	return {
		Image: "w2wizard/git_runner",
		NetworkDisabled: false,
		AttachStdin: false,
		AttachStdout: false,
		AttachStderr: false,
		OpenStdin: false,
		Privileged: false,
		Tty: false,
		// Thank you docker for wasting my time.
		// See: https://github.com/moby/moby/issues/1905
		//StopTimeout: config.timeout,
		//StopSignal: "SIGTERM",
		HostConfig: {
			AutoRemove: false,
			Binds: [
				// TODO: Set as read-only.
				`${process.cwd()}/projects/${project}:/app`,
			],
			Memory: 50 * 1024 * 1024, // ~50MB
			MemorySwap: -1,
			Privileged: false,
			CpusetCpus: "0", // only use one core
		},
		Env: [
			`TIMEOUT=${config.timeout}`,
			`GIT_URL=${request.gitURL}`,
			`GIT_BRANCH=${request.branch}`,
			`GIT_COMMIT=${request.commit}`,
		],
	};
}

/**
 * Launch a container to run the code in.
 * @param project The project name to use as a comparison.
 * @param request The incoming request.
 * @returns Response with the stdout or stderr of the container.
 */
async function launchContainer(dir: string, project: string, request: Body) {
	const config = (await Bun.file(`${dir}/config.json`).json()) as Config;
	if (!config.enabled) {
		log.warn("Project disabled:", project);
		return new Response("Project is currently disabled.", { status: 410 });
	}

	const container = await new Container(
		payload(project, request, config)
	).launch();

	if (!container.id) throw new Error("Container not launched.");
	containers.set(container.id, container);

	let response: Response;
	const { exitCode, logs } = await container.wait();
	switch (exitCode as ExitCode) {
		case ExitCode.Success: {
			response = new Response(logs, { status: 200 });
			break;
		}
		case ExitCode.Killed:
		case ExitCode.NotFound:
		case ExitCode.MinorError:
		case ExitCode.MajorError: {
			response = new Response(logs, { status: 400 });
			break;
		}
		case ExitCode.Timeout: {
			response = new Response(logs, { status: 408 });
			break;
		}
		case ExitCode.ScriptFail:
			throw new Error(`Ooops! That's a buggy script:\n${logs}`);
		default:
			throw new Error(`Unkown code: ${exitCode}:\n${logs}`);
	}
	log.info("Container", container.id, "exited with:", exitCode);
	containers.delete(container.id);
	await container.remove();
	return response;
}

//=============================================================================

/** Register the routes for the /git endpoint. */
export default function register(server: Server) {
	log.debug("Registering /api/grade endpoint");

	server.post("/api/grade/git/:name", async ({ params, request }) => {
		let body: Body;
		const project = params.name;
		const dir = `./projects/${project}`;
		const testFile = `${dir}/index.test.ts`;
		log.info("Received request for:", project);

		try {
			accessSync(testFile, constants.F_OK | constants.R_OK);
		} catch (error) {
			log.warn("Project not found:", project);
			return new Response("Project not found.", { status: 404 });
		}

		try {
			body = await request.json();
			if (!body.gitURL || !body.branch || !body.commit) {
				log.warn("Missing parameters:", body);
				return new Response("Missing parameters", { status: 400 });
			}
		} catch (exception) {
			log.warn("Invalid Body received");
			return new Response("Invalid JSON.", { status: 400 });
		}

		try {
			log.info("Running tests for:", project, "=>", body);
			return await launchContainer(dir, project, body);
		} catch (exception) {
			const error = exception as Error;
			log.error(`Exception triggered: ${error.message}`);
			return new Response(error.message, { status: 500 });
		}
	});
}
