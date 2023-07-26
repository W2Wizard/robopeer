//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { describe, expect, it } from "bun:test";

//=============================================================================

describe("hello_world", () => {
	it("output equals", () => {
		const proc = Bun.spawnSync(["a.out"], {
			cwd: "/app",
		});

		expect(proc.stdout.toString()).toBe("Hello, world!\n");
	});
});
