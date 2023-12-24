#!/bin/bash
#===============================================================================
# Set up a new project directory with a basic directory structure and files.

dir="./projects/$1"
if [ -z "$1" ]; then
    echo "Usage: new.sh <project_name>"
    exit 1
fi
if [ -d "$dir" ]; then
    echo "Project $1 already exists in $dir"
    exit 1
fi


test_template='
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
'

script_template='#!/bin/bash
#==============================================================================

# Exported variables from container:
# - ID = A unique identifier for the runner
# - TMP_DIR = A temporary directory for the runner
# - GIT_DIR = The directory where the repository is cloned
# - WRK_DIR = The directory where the tests are run

OBJ_DIR="$TMP_DIR/obj"

#==============================================================================

# Build the project
function build() {
    echo "[+] ============================================================================"
    echo "[+] Building ..."

    # Build code ...
}

# Run the tests
function run()  {
    build
    echo "[+] ============================================================================"
    echo "[+] Running tests ..."
    cd $WRK_DIR && ls -laF && bun test
}

set -e
run

'

config_template='
{
	"enabled": true,
	"timeout": 25
}
'

mkdir -p "$dir" && cd "$dir"
echo "$script_template" > start.sh
echo "$test_template" > index.test.ts
echo "$config_template" > config.json
echo "New project $1 created in $dir"
chmod +x start.sh
