//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import Logger from "./logger";
import { Elysia } from "elysia";
import registerStats from "./routes";
import registerGrade from "./routes/grade";
import html from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";

export type Server = typeof server;

//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main))
	throw new Error("This module cannot be imported.");

// Entry point
//=============================================================================
export const log = new Logger(`./logs`);
log.info("Starting server...");

const server = new Elysia()
	.use(html())
	.use(staticPlugin({
		assets: "public/assets",
		prefix: "assets",
	}));

[registerGrade, registerStats].forEach((route) => route(server));
server.listen(Number(Bun.env.PORT ?? 8000), ({ port }) => {
	log.info(`Hosted: http://localhost:${port}/`);
});

// TODO: Fetch all the containers and start killing them.
process.on("SIGINT", () => {
	log.info("Shutting down...");
	server.stop();
});
