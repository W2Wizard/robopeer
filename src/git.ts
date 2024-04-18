// ============================================================================
// Copyright (C) 2024 W2Wizard
// See README in the root of the project for license details.
// ============================================================================

import type { GitBody } from "./types";
import Container from "./docker/container";
import { parseLogBuffer } from "./docker/api";
import type { ContainerPayload } from "./docker/container";

// ============================================================================

/** A namespace for the git container. */
export namespace Git {
	/**
	 * Create a payload for the git container.
	 * @param project The project to benchmark.
	 * @param body The body of the request.
	 * @returns The payload for the container.
	 */
	export function payload(project: string, body: GitBody): ContainerPayload {
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
				...Object.entries(body.envs ?? []).map(([key, value]) => `${key}=${value}`),
			],
		};
	}

	/**
	 * Run's the given payload in a container and returns the logs.
	 * @param project The project to benchmark.
	 * @param body The body of the request.
	 * @returns The logs from the container.
	 */
	export async function run(project: string, body: GitBody) {
		const container = new Container(payload(project, body));
		await container.start();

		const response = new Response(
			// @ts-ignore // NOTE(W2): Bun supports this. Somehow still throws an error.
			async function* stream() {
				yield parseLogBuffer(await container.logs());
			}
		)

		await container.wait();
		return response;
	}
}

export default Git;
