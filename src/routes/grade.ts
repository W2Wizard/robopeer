//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import chalk from "chalk";
import { logger, modem } from "@/main";
import { Elysia } from "elysia";
import { accessSync, constants } from "fs";
import { Docker } from "@/docker/docker";

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
function constructContainer(project: string, request: RequestBody) {
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
function launchContainer(project: string, request: RequestBody) {
	const containerPayload = constructContainer(project, request);

	return new Promise<Response>((resolve, reject) => {
		Docker.createContainer(modem, containerPayload, async (res) => {
			if (!res.ok) return reject(await res.json());

			const container = (await res.json()) as { Id: string };
			Docker.startContainer(modem, container.Id, async (res) => {
				if (!res.ok) return reject(await res.json());
				const id = container.Id;
				const queryLogParams = new URLSearchParams({
					stdout: "true",
					stderr: "true",
					timestamps: "true",
				});

				Docker.waitContainer(modem, id, async (res) => {
					if (!res.ok) return reject(await res.json());

					const data = (await res.json()) as { StatusCode: ExitCode };
					Docker.getLogs(modem, id, queryLogParams, async (res) => {
						if (!res.ok) return reject(await res.json());

						logger.info(`${id.slice(0, 12)}: exited: ${data.StatusCode}.`);
						const logs = Docker.parseResponseBuffer(await res.arrayBuffer());

						switch (data.StatusCode) {
							case ExitCode.Success:
								return resolve(new Response(logs, { status: 200 }));
							case ExitCode.NotFound:
							case ExitCode.MinorError:
							case ExitCode.MajorError:
								return resolve(new Response(logs, { status: 400 }));
							case ExitCode.Timeout: {
								const body = `Grader timed out: ${logs}`;
								return resolve(new Response(body, { status: 408 }));
							}
							default: { // Blame us for everything else.
								return reject(
									new Error(`Unkown code: ${data.StatusCode}: ${logs}`)
								);
							}
						}
					});
				});
			});
		});
	});
}

//=============================================================================

/** Register the routes for the /grade endpoint. */
export default function register(server: Elysia) {
	logger.info("Registering /grade endpoint...");

	server.post("/api/grade/git/:name", async ({ params, request }) => {
		const project = params.name;
		const path = `./projects/${project}/index.test.ts`;
		const body = (await request.json()) as RequestBody;
		if (!body.gitURL || !body.branch || !body.commit)
			return new Response("Missing parameters.", { status: 400 });

		logger.info("Running tests for:", project, "=>", body);
		try {
			accessSync(path, constants.F_OK | constants.R_OK);
			return await launchContainer(project, body);
		} catch (exception) {
			const error = exception as Error;
			logger.error(`Exception triggered: ${error.message}`);
			return new Response(error.message, { status: 500 });
		}
	});
}
