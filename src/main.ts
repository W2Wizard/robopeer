//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Elysia } from "elysia";
import { Docker } from "./docker/docker";
import registerGrade from "./routes/grade";
import Logger from "./logger";

//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main))
	throw new Error("This module cannot be imported.");

// Entry point
//=============================================================================

export const logger = new Logger(`./logs`);
logger.info("Starting server...");

const server = new Elysia();
[registerGrade].forEach((route) => route(server));

export const modem = new Docker.Modem();
if (await modem.connect()) {
	logger.info("Connected to docker daemon.");

	server.listen(Number(Bun.env.PORT ?? 8000), ({ port }) => {
		logger.info(`Hosted: http://localhost:${port}/`);
	});
} else {
	logger.error("Failed to connect to docker daemon.");
}
