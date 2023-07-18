//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import jwt from "jsonwebtoken";
import Database from "bun:sqlite";
import * as grade from "./routes/grade";
import { FileSystemRouter } from "bun";
import Router, { Route, routes } from "./router";

// Routes
//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main)) {
	throw new Error("This module cannot be imported.");
}

// Routes
//=============================================================================

routes["/dock"] = new Route(["GET"], async () => {
	return new Response("Hello World!");
});

routes["/api/grade"] = new Route(["POST", "GET"], async (request, url) => {
	switch (request.method) {
		case "POST": return grade.POST(request, url);
		case "GET": return grade.GET(request, url);
		// NOTE(W2): Route class handles this already.
		default: return new Response();
	}
});

// Entry point for the application.
//=============================================================================

export const db = new Database("db.sqlite", { readwrite: true, create: false });
export const server = Bun.serve({
	port: 8080,
	fetch(req) { return Router(req, "pages"); }
});

console.log(`Server running at http://localhost:${server.port}/`);
