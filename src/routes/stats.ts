import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";
import { log } from "@/main";
import { Docker } from "@/docker/api";
import Modem from "@/docker/modem";

async function getStats() {
	const modem = new Modem();
	await modem.connect();

	const containers = new Promise<number>((resolve, reject) => {
		Docker.list(modem, async (res) => {
			const containers = (await res.json() as []).length;

			modem.disconnect();
			return res.ok ? resolve(containers) : reject(containers);
		});

	});

	return new Response((await containers).toString(), { status: 200 });
}

/** Register the routes for the /stats endpoint. */
export default function register(server: Elysia) {
	log.debug("Registering /stats endpoint...");

	server.use(staticPlugin({
		prefix: "/stats",
	}));

	server.get("/", ({ set }) => {
		log.debug("Redirecting to /stats/index.html");
		set.redirect = "/stats/index.html";
	});

	server.get("/stats/data", async () => {
		log.debug("Received request for stats");
		return await getStats();
	});
}
