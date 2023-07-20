//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import * as grade from "./routes/grade";
import { Route, routes } from "./router";
import Docker from "./docker/docker";

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
	process.exit(1);

// List containers
//docker.listContainers(async (response) => {
//	console.log(await response.json());
//	docker.disconnect(); // Optional, otherwise process keeps running
//});

// Create a container
const container = {
	Image: "node:latest",
	Name: "test",
	Cmd: ["node", "-e", "console.log('Hello World!');"],
}

docker.createContainer(container, async (response) => {
	console.log(await response.json());
});

// docker.createContainer(container, async (response) => {
// 	// const data = await response.json() as any;
// 	console.log(await response.text());

// 	// docker.startContainer(data.Id, async (response) => {
// 	// 	console.log(await response.text());
// 	// });
// });


//export const server = Bun.serve({
//	port: 8080,
//	fetch(req) { return Router(req, "pages"); }
//});

//console.log(`Server running at http://localhost:${server.port}/`);
