//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Elysia } from "elysia";

//=============================================================================

// Register the routes for the /grade endpoint.
export default function register(server: Elysia) {
	console.log("Registering /grade endpoint.");

	server.post("/api/grade", async ({ request, query, params }) => {
		const grading = new Promise<string>((resolve, reject) => {
			throw new Error("Not implemented.");
		});

		try {
			return new Response(await grading, { status: 200 });
		} catch (err) {
			return new Response(err as string, { status: 400 });
		}
	});
}
