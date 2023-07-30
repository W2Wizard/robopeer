//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import chalk from "chalk";
import { modem } from "@/main";
import { Elysia } from "elysia";
import { accessSync, constants } from "fs";
import { Docker } from "@/docker/docker";

interface RequestBody {
	// The git repository to clone.
	gitURL: string;
	// The branch to clone.
	branch: string;
	// The hash of the commit to clone.
	commit: string;
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
 * Launch a sandboxed container to run the code in.
 * @param request The request to get the code from.
 * @returns stdout or stderr of the container.
 */
function launchsandbox(project: string, request: RequestBody) {
	const container = constructContainer(project, request);
	const logParams = new URLSearchParams({
		stdout: "true",
		stderr: "true",
		timestamps: "true",
	});

	return new Promise<Response>((resolve, reject) => {
		Docker.createContainer(modem, container, async (res) => {
			if (!res.ok) {
				return reject(await res.json());
			}
			const containerID = (await res.json()) as { Id: string };

			Docker.startContainer(modem, containerID.Id, async (res) => {
				if (!res.ok) {
					return reject(await res.json());
				}
				Docker.waitContainer(modem, containerID.Id, async (res) => {
					if (!res.ok) {
						return reject(await res.json());
					}

					const data = (await res.json()) as { StatusCode: number };
					Docker.getLogs(modem, containerID.Id, logParams, async (res) => {
						if (!res.ok) {
							return reject(await res.json());
						}

						const logs = Docker.parseDaemonBuffer(await res.arrayBuffer());
						return resolve(
							new Response(logs, { status: data.StatusCode == 0 ? 200 : 400 })
						);
					});
				});
			});
		});
	});
}

//=============================================================================

// Register the routes for the /grade endpoint.
export default function register(server: Elysia) {
	console.log(chalk.green("Registering /grade routes."));

	// For git repositories
	server.post("/api/grade/git/:name", async ({ params, request }) => {
		const project = params.name;
		const path = `./projects/${project}/index.test.ts`;
		const body = (await request.json()) as RequestBody;
		if (!body.gitURL || !body.branch || !body.commit)
			return new Response("Missing parameters.", { status: 400 });

		try {
			accessSync(path, constants.F_OK | constants.R_OK);
			return await launchsandbox(project, body);
			//return new Response(await launchsandbox(project, body), { status: 200 });
		} catch (exception) {
			const error = exception as Error;
			return new Response(error.message, { status: 500 });
		}
	});
}
