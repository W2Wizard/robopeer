//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { mkdirSync } from "fs"
import { randomUUID } from "crypto";

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

/**
 * Runs the code in a sandbox and returns the result.
 * @param request The incoming request.
 * @returns The response to send back to the client.
 */
async function runner(request: Request) {
	const guard = middleware(request);
	if (guard) return guard;

	const id = randomUUID();
	const directory = `./tmp/${id}/`

	try {
		console.log("Grading code...");
		const body = await request.json() as { code: string };
		mkdirSync(directory, { recursive: true });
		await Bun.write(Bun.file(`${directory}/${id}.c`), body.code);

		{ // Compile
			console.log("Compiling...");
			const { exitCode, stderr } = Bun.spawnSync(["gcc", `${id}.c`], {
				cwd: directory,
				env: { ...process.env }
			});

			if (exitCode !== 0 || stderr.length > 0)
				return new Response(stderr.toString(), { status: 400 });
		}

		{ // Execute
			console.log("Executing...");
			const { exitCode, stderr, stdout } = Bun.spawnSync([`${directory}/a.out`], {
				cwd: directory,
				env: { ...process.env }
			});

			if (exitCode !== 0 || stderr.length > 0)
				return new Response(stderr.toString(), { status: 400 });
			return new Response(stdout.toString(), { status: 200 });
		}
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
