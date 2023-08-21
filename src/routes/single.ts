//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import Container, { ExitCode } from "@/docker/container";
import { Server, containers, log } from "@/main";

interface Body {
	code: string;
	flags: string;
	args: string; // Semi-colon separated list of arguments.
	timeout: number;
	language: string;
}

//=============================================================================

/**
 * Construct a container to run the code in.
 * @param project The project to run the code in.
 * @param request The request to get the code from.
 * @returns The container object.
 */
export function payload(request: Body) {
	return {
		Image: "w2wizard/single_runner",
		NetworkDisabled: true,
		AttachStdin: false,
		AttachStdout: false,
		AttachStderr: false,
		OpenStdin: false,
		Privileged: false,
		Tty: false,
		HostConfig: {
			AutoRemove: false,
			Memory: 50 * 1024 * 1024, // ~50MB
			MemorySwap: -1,
			Privileged: false,
			CpusetCpus: "0", // only use one core
		},
		Env: [
			`TIMEOUT=${request.timeout}`,
			`CODE_FLAGS=${request.flags}`,
			`CODE_SOURCE=${request.code}`,
			`CODE_LANGUAGE=${request.language}`,
			`CODE_ARGV=${request.args}`,
			`CODE_ARGC=${request.args.length}`,
		],
	};
}

/**
 * Launch a container to run the code in.
 * @param project The project name to use as a comparison.
 * @param request The incoming request.
 * @returns Response with the stdout or stderr of the container.
 */
async function launchContainer(request: Body) {
	const container = await new Container(payload(request)).launch();

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
			throw new Error(`Ooops! That's a buggy script: ${logs}`);
		default:
			throw new Error(`Unkown code: ${exitCode}: ${logs}`);
	}
	log.info("Container", container.id, "exited with:", exitCode);
	containers.delete(container.id);
	await container.remove();
	return response;
}

/** Register the routes for the /single endpoint. */
export default function register(server: Server) {
	log.debug("Registering /api/single endpoint");

	server.post("/api/grade/single", async ({ params, request }) => {
		let body: Body;
		log.info("Received single code request");

		try {
			body = await request.json();
			if (!body.language || !body.timeout) {
				log.warn("Missing parameters:", body);
				return new Response("Missing parameters", { status: 400 });
			}
		} catch (exception) {
			log.warn("Invalid Body received");
			return new Response("Invalid JSON.", { status: 400 });
		}

		try {
			log.info("Running single code test:", "=>", body);
			return await launchContainer(body);
		} catch (exception) {
			const error = exception as Error;
			log.error(`Exception triggered: ${error.message}`);
			return new Response(error.message, { status: 500 });
		}
	});
}
