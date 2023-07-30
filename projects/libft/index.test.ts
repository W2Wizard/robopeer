//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { dlopen, FFIType, ptr } from "bun:ffi";
import { describe, expect, it, beforeAll, afterAll } from "bun:test";

/**
 * WARNING: bun:ffi does not manage memory for you.
 * You must free the memory when you're done with it.
 *
 * This is very important regarding functions that return allocated memory.
 * (ft_split, ft_strtrim, ft_itoa, etc.)
 *
 * Might be useful for code execution of C files directly:
 * @see https://github.com/TinyCC/tinycc
 *
 * TODO: What happens when you segfault in a function?
 */
//=============================================================================

// TODO: Come up with a neater way to generate the type definitions?
// NOTE(W2): Convert the static library to a shared library for dlopen to work.
const { symbols, close } = dlopen("libft.so", {
	ft_strlen: {
		returns: FFIType.i32,
		args: [FFIType.ptr],
	},
});

beforeAll(() => {
	process.on("beforeExit", (err) => {
		close();
		process.exit(0);
	});

	["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
		process.on(signal, () => {
			close();
			process.exit(1);
		});
	});
});

afterAll(() => {
	close();
});

//=============================================================================

describe("makefile", () => {
	it("compiles with '-Wextra -Werror -Wall'", async () => {
		const makefile = Bun.file("Makefile");
		const text = await makefile.text();
		const requiredFlags = ["-Wall", "-Wextra", "-Werror"];

		expect(requiredFlags.every((flag) => text.includes(flag))).toBe(true);
	});
});

describe("strlen", () => {
	it("normal string", async () => {
		const sample = "Hello, world!";
		const str = ptr(Buffer.from(`${sample}\0`, "utf8"));

		expect(symbols.ft_strlen(str)).toBe(sample.length);
	});

	it("empty string", async () => {
		const str = ptr(Buffer.from(`\0`, "utf8"));

		expect(symbols.ft_strlen(str)).toBe(0);
	});
});
