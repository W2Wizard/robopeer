//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Elysia } from "elysia";

//=============================================================================

// Register the routes for the /grade endpoint.
export default function register(server: Elysia) {
	console.log("Registering grade route.");

	server.post("/grade/:repo", ({ request, query, params }) => {
		return new Response("Hello World!", { status: 200 });
	});
}
