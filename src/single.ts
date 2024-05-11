// ============================================================================
// Copyright (C) 2024 W2Wizard
// See README in the root of the project for license details.
// ============================================================================

import type { FileBody } from "./types";
import Container from "./docker/container";
import { parseLogBuffer } from "./docker/api";
import type { ContainerPayload } from "./docker/container";
import { StatusError } from "itty-router";

// ============================================================================

/** A namespace for the git container. */
export namespace Single {
	/**
	 * Create a payload for the git container.
	 * @param project The project to benchmark.
	 * @param body The body of the request.
	 * @returns The payload for the container.
	 */
	export function payload(body: FileBody): ContainerPayload {
		return {
			Image: "w2wizard/single",
			NetworkDisabled: true,
			AttachStdin: false,
			AttachStdout: false,
			AttachStderr: false,
			OpenStdin: false,
			Tty: false,
			HostConfig: {
				AutoRemove: false,
				Memory: 50 * 1024 * 1024, // ~50MB
				MemorySwap: -1,
				Privileged: false,
				CpusetCpus: "0", // only use one core
			},
			Env: [
				`TIMEOUT=20s`,
				`CODE_FLAGS=${body.data.flags}`,
				`CODE_SOURCE=${body.data.content}`,
				`CODE_LANGUAGE=${body.data.lang}`,
				`CODE_ARGV=${body.data.args}`,
				`CODE_ARGC=${body.data.args.length}`,
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
	export async function run(body: FileBody) {
		const container = new Container(payload(body));
		await container.start();

		const response = new Response(
			// @ts-ignore // NOTE(W2): Bun supports this. Somehow still throws an error.
			async function* stream() {
				yield parseLogBuffer(await container.logs());
			}
		)

		// Handle container exit codes.
		switch (await container.wait()) {
			case 1:
			case 2:
			case 139:
			case 127:
				return new Response(response.body, {
					status: 422
				});
			case 128:
				throw new StatusError(500, "Robopeer is buggy. Please report this issue.");
			case 124: // SIGALRM
				throw new StatusError(408, "Program timed out.");
			case 137: // SIGKILL
				throw new StatusError(422, "Program killed due to memory limit. Are you doing something nasty?");
		}
		return response;
	}
}

export default Single;
