//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import * as grade from "./routes/grade";
import Router, { Route, routes } from "./router";
import Docker from "./docker/docker";
import { Socket } from "bun";

// Routes
//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main)) {
	throw new Error("This module cannot be imported.");
}

// Routes
//=============================================================================

routes["/api/grade"] = new Route(["POST", "GET"], async (request, url) => {
	switch (request.method) {
		case "POST": return grade.POST(request, url);
		default: return new Response();
	}
});

// Entry point for the application.
//=============================================================================

const docker = new Docker();
if (!(await docker.connect()))
	throw new Error("Failed to connect to docker daemon.");

docker.listContainers(async (response) => {
	console.log(await response.text());
});

//export const server = Bun.serve({
//	port: 8080,
//	fetch(req) { return Router(req, "pages"); }
//});

//console.log(`Server running at http://localhost:${server.port}/`);
