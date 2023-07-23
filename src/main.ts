//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import * as grade from "./routes/grade";
import Router, { Route, routes } from "./router";
import Docker from "./docker/docker";
import { sleep } from "bun";

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
if (!(await docker.connect())) {
	console.error("Failed to connect to docker daemon.");
	process.exit(1);
}

export const server = Bun.serve({
	port: 8080,
	fetch(req) { return Router(req, "pages"); }
});

console.log(`Server running at http://localhost:${server.port}/`);

// Create a container
const container = {
	Image: "node:latest",
	Name: "test",
	Cmd: ["tail", "-f", "/dev/null"],
}

docker.createContainer(container, async (response) => {
	const data = await response.json() as any;

	docker.startContainer(data.Id, async (response) => {
		console.log("Container:", data.Id, "started.");

		docker.listContainers(async (response) => {
		});
	});
});
