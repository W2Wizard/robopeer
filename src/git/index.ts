//=============================================================================
// W2Wizard, Amsterdam @ 2024
// See README and LICENSE files for details.
//=============================================================================

import { $ } from "bun";
import type { GitBody } from "../types/general";
import Container, { ExitCode, type ContainerInit } from "../container";

//=============================================================================


/**
 * Construct a container to run the code in.
 * @param project The project to run the code in.
 * @param request The request to get the code from.
 * @returns The container object.
 */
export function payload(project: string, body: GitBody): ContainerInit {
	return {
		Image: "w2wizard/git",
		Tty: false,
		NetworkDisabled: false, // TODO: Build scripts may rely on this!
		AttachStdin: false,
		AttachStdout: false,
		AttachStderr: false,
		OpenStdin: false,

		// Thank you docker for wasting my time.
		// See: https://github.com/moby/moby/issues/1905
		//StopTimeout: config.timeout,
		//StopSignal: "SIGTERM",
		HostConfig: {
			AutoRemove: false,
			Binds: [
				`${process.cwd()}/projects/${project}:/var/dev:ro`, // Set as read-only
			],
			Memory: 50 * 1024 * 1024, // ~50MB
			MemorySwap: -1,
			Privileged: false,
			CpusetCpus: "0", // only use one core
		},
		Env: [
			`TIMEOUT=20s`,
			`GIT_URL=${body.data.repo}`,
			`GIT_BRANCH=${body.data.branch}`,
			`GIT_COMMIT=${body.data.commit}`,
			...Object.entries(body.envs).map(([key, value]) => `${key}=${value}`),
		],
	};
}

//=============================================================================

export default async function execGit(req: Request, body: GitBody) {
	const pattern = /^http:\/\/[^\/]+\/[^\/]+$/;
	if (!pattern.test(req.url)) {
		return new Response("Invalid repository URL", { status: 400 });
	}

	// Check if the project exists
	const index = req.url.lastIndexOf("/");
	const project = req.url.slice(index + 1);
	const projects = await $`ls projects`.text();
	if (!projects.split("\n").includes(project)) {
		return new Response(`Project ${project} not found`, { status: 404 });
	}

	// Launch the container
	const container = await new Container(payload(project, body)).launch();
	if (!container.id) {
		return new Response("Failed to launch container", { status: 500 });
	}

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
		default:
			throw `Unkown code: ${exitCode}:\n${logs}`;
	}
	await container.remove();
	return response;
}
