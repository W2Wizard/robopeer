// ============================================================================
// Copyright (C) 2024 W2Wizard
// See README in the root of the project for license details.
// ============================================================================

import { $ } from "bun";

// ============================================================================

const test_template=`
//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { $ } from "bun";
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
		expect(output).toBe("Hello, world!\\n");
	});
});
`

const script_template=`#!/bin/bash
#==============================================================================

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
`

// Check if the project name is provided.
if (process.argv.length < 3) {
	console.error("Usage: new <project_name>");
	process.exit(1);
}

const project = process.argv[2];
if (project.includes("/")) {
	console.error("Invalid project name.");
	process.exit(1);
}

const { exitCode, stderr } = await $`mkdir -p ./projects/${project}`;
if (exitCode !== 0) {
	console.error("Unable to create project directory.");
	console.error("Reason", stderr);
	process.exit(1);
}

await $`echo "${script_template}" > ./projects/${project}/start.sh`;
await $`echo "${test_template}" > ./projects/${project}/index.test.ts`;
await $`chmod +x ./projects/${project}/start.sh`
console.log("Project created successfully.");
