//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { logger } from "@/main";
import { Elysia } from "elysia";
import { accessSync, constants } from "fs";
import Container from "@/docker/container";

interface RequestBody {
	gitURL: string;
	branch: string;
	commit: string;
}

enum ExitCode {
	Success = 0,
	MinorError = 1,
	MajorError = 2,
	Timeout = 124, // NOTE(W2): Requires coreutils from GNU.
	NotFound = 128,
}

//=============================================================================

/**
 * Construct a container to run the code in.
 * @param project The project to run the code in.
 * @param request The request to get the code from.
 * @returns The container object.
 */
export function constructContainer(project: string, request: RequestBody) {
	return {
		Image: "w2wizard/runner",
		NetworkDisabled: false,
		AttachStdin: false,
		AttachStdout: false,
		AttachStderr: false,
		OpenStdin: false,
		Privileged: false,
		Tty: false,
		StopTimeout: 10, // ~10 seconds
		StopSignal: "SIGTERM",
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
async function launchContainer(project: string, request: RequestBody) {
	const container = new Container(constructContainer(project, request));
	logger.info("Container constructed:", container.payload);
	const launchErr = await container.launch();
	if (launchErr) {
		return new Response(launchErr.message, { status: 500 });
	}

	logger.info("Container launched:", container.id);
	const [wait, error] = await container.wait();
	if (error) return new Response(error.message, { status: 500 });
	const { exitCode, logs } = wait!;

	let response: Response;
	switch (exitCode as ExitCode) {
		case ExitCode.Success: {
			response = new Response(logs, { status: 200 });
			break;
		}
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
		default:
			throw new Error(`Unkown code: ${exitCode}: ${logs}`)
	}
	await container.remove();
	logger.info("Container removed.");
	return response;
}

//=============================================================================

/** Register the routes for the /grade endpoint. */
export default function register(server: Elysia) {
	logger.info("Registering /grade endpoint...");

	server.post("/api/grade/git/:name", async ({ params, request }) => {
		const project = params.name;
		const path = `./projects/${project}/index.test.ts`;

		// BUG(W2): Empty body is not handled correctly.
		const body: RequestBody = await request.json();
		if (!body.gitURL || !body.branch || !body.commit)
			return new Response("Missing parameters.", { status: 400 });

		try {
			logger.info("Running tests for:", project, "=>", body);
			accessSync(path, constants.F_OK | constants.R_OK);
			return await launchContainer(project, body);
		} catch (exception) {
			const error = exception as Error;
			logger.error(`Exception triggered: ${error.message}`);
			return new Response(error.message, { status: 500 });
		}
	});
}
