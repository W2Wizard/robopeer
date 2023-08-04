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
if [ -z "$GIT_URL" ] || [ -z "$GIT_BRANCH" ] || [ -z "$GIT_COMMIT" ]; then
    echo -e "GIT_URL, GIT_BRANCH and GIT_COMMIT must be set"
    exit 1
fi

ID=$(xxd -l 16 -ps /dev/urandom | tr -d " \n")
ProjectDIR="/tmp/$ID/project"
ObjectsDIR="/tmp/$ID/objects"
Home="/home/runner/"

# Functions
#==============================================================================

# Fetch the project
function gitCloneCommit() {
    echo "[+] Cloning $GIT_URL"
    git clone $GIT_URL $ProjectDIR -b $GIT_BRANCH --recurse-submodules --quiet
    cd $ProjectDIR

    echo "[+] Switching to $GIT_COMMIT"
    git checkout $GIT_COMMIT --quiet
    cd - > /dev/null
}

# Build the project
function build() {
    echo "[+] Building ..."
    timeout 1m make -C $ProjectDIR -j4

    # Other steps ...

    cp /app/index.test.ts $Home
}

# Run the tests
function run()  {
    echo "[+] Running tests ..."
    su - runner -s /bin/rksh -c "bun test"
}

# Main
#==============================================================================
set -e

gitCloneCommit
build
run

'

config_template='
{
	"enabled": true,
	"timeout": 1000
}
'

mkdir -p "$dir" && cd "$dir"
echo "$script_template" > start.sh
echo "$test_template" > index.test.ts
echo "$config_template" > config.json
echo "New project $1 created in $dir"
chmod +x start.sh
