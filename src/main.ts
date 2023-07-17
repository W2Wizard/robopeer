//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import jwt from "jsonwebtoken";
import Router, { Routes } from "./routes";

// Routes
//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main)) {
	throw new Error("This module cannot be imported.");
}

//=============================================================================

Routes["/"] = { methods: ["GET"], handle: (request, url) => {
	return new Response(url.searchParams.get("name") || "Hello World!");
}};

Routes["/signin"] = { methods: [], handle: (request, url) => {
	return new Response("");
}};

Routes["/signout"] = { methods: [], handle: (request, url) => {
	return new Response("");
}};

Routes["/signup"] = { methods: [], handle: (request, url) => {
	return new Response("");
}};


// Entry point for the application.
//=============================================================================

const server = Bun.serve({ port: 8080, fetch(req) {
	return Router(req)
}});

console.log(`Server running at http://localhost:${server.port}/`);
