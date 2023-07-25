//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { mkdirSync } from "fs";
import { randomUUID } from "crypto";

// TODO: Come up with some sort of solution for configurtions

//=============================================================================

/**
 * Git clones a repository. Assumes the current user has access to the repo.
 * @param url
 * @param directory
 */
function gitClone(url: string, directory: string) {
	const command = ["git", "clone", url, ".", "--recurse-submodules"];
	const { stderr, success } = Bun.spawnSync(command, {
		cwd: directory,
		env: { ...process.env }
	});

	const subprocess = Bun.spawn({
		cmd: ["echo", "hello"],
		stdout: "pipe",
		stderr: "pipe",
	 });

	subprocess.stderr

	return success ? undefined : stderr.toString();
}

/**
 * Assumes that the repo is a C/C++ project with a Makefile in the CWD.
 * @param directory The directory to run 'make' in.
 * @param projectInfo The project information.
 */
function buildAndRunRepo(directory: string) {
	// NOTE(W2): We multithread the build process, but if the makefile breaks
	// that's not our problem. The student should fix their makefile.
	const { success, stderr } = Bun.spawnSync(["make", "-j4"], {
		cwd: directory,
		env: { ...process.env }
	});

	return success ? undefined : stderr.toString();
}

//=============================================================================

/**
 * YOU SHALL NOT PASS!
 * @param request The incoming request.
 * @returns The response to send back to the client, if any.
 */
function middleware(request: Request): Response | undefined {
	if (request.method !== "POST")
		return new Response("Method not allowed.", { status: 405 });

	const contentType = request.headers.get("content-type");
	if (!contentType || !contentType.includes("application/json"))
		return new Response("Content type must be JSON.", { status: 400 });

	return undefined;
}

async function runner(request: Request) {
	const guard = middleware(request);
	if (guard) return guard;

	const id = randomUUID();
	const directory = `./tmp/${id}/`

	try {
		console.log("Grading repository...");
		const body = await request.json() as { code: string };
		mkdirSync(directory, { recursive: true });

		// Clone the repo
		const cloneError = gitClone("https://github.com/W2Codam/libft.git", directory);
		if (cloneError) {
			console.log("Clone error:", cloneError);
			return new Response(cloneError, { status: 400 });
		}

		// Build the repo
		const buildError = buildAndRunRepo(directory);
		if (buildError) {
			console.log("Build error:", buildError);
			return new Response(buildError, { status: 400 });
		}

		return new Response("Pass!", { status: 200 });
	} catch (exception) {
		const error = exception as Error;
		return new Response(error.toString(), { status: 500 });
	}
}

//=============================================================================

if (import.meta.main === (import.meta.path === Bun.main)) {
	const server = Bun.serve({ port: 8000, fetch(request) {
		return runner(request);
	}});

	console.log(`Webserver: http://localhost:${server.port}/`);
	["SIGINT", "SIGTERM"].forEach(signal => {
		//@ts-ignore - BunJS TS definitions are a bit sus
		process.on(signal, () => {
			server.stop();
			console.log("Server closed.");
		});
	});
}
