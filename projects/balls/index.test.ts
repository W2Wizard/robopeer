
//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { beforeAll, describe, expect, it } from "bun:test";

//=============================================================================

// NOTE(W2): Please read: https://bun.sh/docs/api/ffi before using ffi.

/**
 * Run a command with arguments and return the output.
 * @param bin  The command to run.
 * @param args The arguments to pass to the command.
 * @returns The output of the command (stdout + stderr).
 */
function runWith(bin: string, args: string[]) {
	const { stdout, stderr } = Bun.spawnSync([bin, ...args], {
		stderr: "pipe",
		stdout: "pipe",
	});

	return Buffer.concat([stdout, stderr]).toString();
}

//=============================================================================

beforeAll(() => {
	["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
		process.on(signal, () => {
			process.exit(1);
		});
	});
});

describe("hello_world", () => {
	it("output equals", () => {
		const output = runWith("/bin/echo", ["Hello, world!"]);
		expect(output).toBe("Hello, world!\n");
	});
});

