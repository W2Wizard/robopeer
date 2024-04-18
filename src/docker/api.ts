// ============================================================================
// Copyright (C) 2024 W2Wizard
// See README in the root of the project for license details.
// ============================================================================

import type { paths } from "./dockerapi";
import createClient from "openapi-fetch";

// ============================================================================

/**
 * Parse the response buffer from the docker daemon.
 * ```md
 * Example response from the docker daemon:
 * 01 00 00 00 00 00 00 1f 52 6f 73 65 73 20 61 72  65 ...
 * │  ─────┬── ─────┬─────  R  o  s  e  s     a  r   e ...
 * │       │        │
 * └stdout │        │
 *         │        └─ 0x0000001f = 31 bytes (including the \n at the end)
 *       unused
 * ```
 *
 * @note Each line is always ending with a newline character.
 * @see https://ahmet.im/blog/docker-logs-api-binary-format-explained/
 */
export function parseLogBuffer(buff: ArrayBuffer): string {
	let data = "";
	let offset = 0;
	const buffer = Buffer.from(buff);

	while (offset < buffer.length) {
		const length = buffer.readUInt32BE((offset += 4));
		const line = buffer.subarray((offset += 4), (offset += length));
		const pos = line.indexOf(" ");

		// Some formatting of the timestamp.
		// BUG(W2): Will cause bugs if we request logs without timestamps.
		const message = line.subarray(pos + 1);
		const date = line.subarray(0, pos).subarray(0, 19);
		date.set([32], date.indexOf("T"));

		data += `[${date}] ${message}`;
	}

	return (
		data
			// Regex away all the color codes.
			.replace(/\033\[[0-9;]*m|\[\d+m/g, "")
			.replaceAll("(pass)", "(✓)")
			.replaceAll("(fail)", "(✗)")
	);
}

const socketFetch: typeof fetch = async (input, init) => {
	return await fetch(input, {
		// @ts-ignore // NOTE(W2): Bun supports this.
		unix: "/var/run/docker.sock",
		...init,
	});
};

/** The docker client used to fetch requests with via unix socket */
export const docker = createClient<paths>({
	baseUrl: `http://localhost/v${Bun.env.DOCKER_VERSION ?? "1.44"}`,
	fetch: socketFetch,
	headers: {
		"Host": "localhost",
		"User-Agent": Bun.env.SERVER ?? "robopeer",
	},
});
