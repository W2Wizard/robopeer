//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { $ } from "bun";
import execGit from "./git";
import { execFile } from "./file";
import type { Body } from "./types/general";

//=============================================================================

/** Create a new testing instance */
async function POST(request: Request) {
	console.log("POST", request.url);
	const body = await request.json() as Body;
	switch (body.type) {
		case "file":
			return await execFile(request, body);
		case "git":
			return await execGit(request, body);
		default:
			return new Response("Request type not supported", { status: 404 });
	}
}

/** Provide a list of available projects */
async function GET(request: Request) {
	const projects = await $`ls projects`.text();
	return new Response(projects, {
		status: 204,
		headers: {
			"Content-Type": "text/plain"
		}
	});
}

/** Provide a list of available methods */
function OPTIONS(_: Request) {
	return new Response(null, {
		status: 204,
		headers: {
			"Allow": "GET, POST, OPTIONS",
		},
	});
}

//=============================================================================

console.log("Starting server...");
Bun.serve({
	port: process.env.PORT || 9000,
	development: true,
	async fetch(req: Request) {
		switch (req.method) {
			case "POST": {
				try {
					return POST(req);
				} catch {
					return new Response("Invalid request", { status: 400 });
				}
			}
			case "GET": return GET(req);
			case "OPTIONS": return OPTIONS(req);
			default:
				return new Response("Unsupported method", { status: 405 });
		}
	},
});
