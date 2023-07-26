//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { docker } from "@/main";
import chalk from "chalk";
import { Elysia } from "elysia";
import { accessSync, constants } from "fs";

interface RequestBody {
	// The git repository to clone.
	gitURL: string;
	// The branch to clone.
	branch: string;
	// The hash of the commit to clone.
	commit: string;
}

//=============================================================================

// Register the routes for the /grade endpoint.
export default function register(server: Elysia) {
	console.log(chalk.green("Registering /grade routes."));

	// For git repositories
	server.post("/api/grade/git/:name", async ({ params, request }) => {
		const project = params.name;
		const path = `./projects/${project}/index.test.ts`;

		const { gitURL, branch, commit } = await request.json() as RequestBody;
		if (!gitURL || !branch || !commit)
			return new Response("Missing parameters.", { status: 400 });

		try {
			accessSync(path, constants.F_OK | constants.R_OK);
			return new Response("Project found.", { status: 200 });
		} catch (error) {
			return new Response("Project not found.", { status: 404 });
		}
	});
}
