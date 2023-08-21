//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import index from "$/index";
import Modem from "@/docker/modem";
import { Server, log } from "@/main";
import { Docker } from "@/docker/api";

//=============================================================================

async function getContainerCount() {
	log.debug("getContainerCount()");
	return await new Promise<string>(async (resolve, reject) => {
		const modem = new Modem();
		await modem.connect();

		Docker.list(modem, async (response) => {
			if (!response.ok) return reject(response.statusText);

			const body = await response.json() as [];
			modem.disconnect();
			return resolve(body.length.toString());
		});
	});
}

//=============================================================================

/** Register the routes for the /stats endpoint. */
export default function register(server: Server) {
	log.debug("Registering /api/count endpoint");
	log.debug("Registering /api/stop endpoint");
	log.debug("Registering /index endpoint...");

	server.get("/", ({ html }) => index(html));
	server.get("/api/count", async () => await getContainerCount());
	server.post("/api/stop", () => {
		log.info("Stopping server...");
		server.stop();
		return "Killed";
	});
}
