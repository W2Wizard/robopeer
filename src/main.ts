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

	// Entry point
//=============================================================================

const server = new Elysia();
[ registerGrade ].forEach(route => route(server));

export const docker = new Docker();
if (await docker.connect()) {
	console.log("Connected to docker daemon.");

	server.listen(8000, ({port}) => {
		console.log(`Webserver: http://localhost:${port}/`);
	});
} else {
	console.error("Failed to connect to docker daemon.");
}
