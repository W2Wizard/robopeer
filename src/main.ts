//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import Logger from "./logger";
import { Elysia } from "elysia";
import Modem from "./docker/modem";
import htmlPlugin from "@elysiajs/html";
import staticPlugin from "@elysiajs/static";
import registerGit from "./routes/git";
import registerStats from "./routes/stats";
import registerSingle from "./routes/single";
import Container from "./docker/container";

export type Server = typeof server;

//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main))
	throw new Error("This module cannot be imported.");

async function isDockerRunning() {
	const modem = new Modem();
	try {
		await modem.connect();
		modem.disconnect();
	} catch (error) {
		console.error(error);
		return false;
	}
}

// Entry point
//=============================================================================

/** A map of all the containers that are currently running. */
export const log = new Logger(`./logs`);
//if (!await isDockerRunning()) {
//	log.error("Docker is not running!");
//	process.exit(1);
//}

log.info("Starting server...");
const server = new Elysia().use(htmlPlugin()).use(
	staticPlugin({
		assets: "public/assets",
		prefix: "assets",
	})
);

export let containers: Map<string, Container> = new Map();
[registerGit, registerSingle, registerStats].forEach((route) => route(server));
server.listen(Number(Bun.env.PORT ?? 8000), ({ port }) => {
	log.info(`Hosted: http://localhost:${port}/`);
});

process.on("SIGINT", async () => {
	log.info(`Killing all ${containers.size} containers`);

	for (const [id, container] of containers) {
		log.debug(`Killing container ${id}`);
		try {
			await container.kill();
		} catch (error) {
			log.error(`Failed to kill container ${id}: ${error}`);
		}
	}
	log.info("Shutting down...");
	server.stop();
});
