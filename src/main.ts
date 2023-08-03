//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Elysia } from "elysia";
import registerGrade from "./routes/grade";
import Logger from "./logger";

//=============================================================================

if (import.meta.main !== (import.meta.path === Bun.main))
	throw new Error("This module cannot be imported.");

// Entry point
//=============================================================================

export const log = new Logger(`./logs`);
log.info("Starting server...");

const server = new Elysia();
[registerGrade].forEach((route) => route(server));
server.listen(Number(Bun.env.PORT ?? 8000), ({ port }) => {
	log.info(`Hosted: http://localhost:${port}/`);
});
