//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Elysia } from "elysia";
import Docker from "./docker/docker";
import registerGrade from "./routes/grade";

//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main))
	throw new Error("This module cannot be imported.");

// Webserver
//=============================================================================

const server = new Elysia();
[ registerGrade ].forEach(route => route(server));

// Entry point
//=============================================================================

export const docker = new Docker();
if (await docker.connect()) {
	console.log("Connected to docker daemon.");

	server.listen({port: Bun.env.PORT || 9999, serverName: "Bun"}, ({port}) => {
		console.log(`Webserver: http://localhost:${port}/`);
	});
} else {
	console.error("Failed to connect to docker daemon.");
}
