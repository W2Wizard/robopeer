//=============================================================================
// W2Wizard, Amsterdam @ 2024
// See README and LICENSE files for details.
//=============================================================================

import { RawHTTP } from "./http";
import createClient from "openapi-fetch";
import type { paths } from "./types/docker";

//=============================================================================

/**
 * Fetch using a socket.
 */
const socketFetch: typeof fetch = async (input, init) => {
	return new Promise(async (resolve, reject) => {
		let parser = new RawHTTP.ResponseParser();
		let socket = await Bun.connect({
			unix: "/var/run/docker.sock",
			socket: {
				error(_, error) {
					console.error("SOCKET ERROR", error);
					reject(error);
				},
				connectError(_, error) {
					console.error("CONNECT ERROR", error);
					reject(error);
				},
				data(_, data) {
					parser.append(data);

					if (parser.isComplete) {
						return resolve(parser.toResponse());
					}
				}
			},
		});

		const req = await RawHTTP.readRequest(new Request(input, init))
		console.log("REQUEST", req);
		socket.write(req);
	});
};

//=============================================================================

export const docker = createClient<paths>({
	baseUrl: "http://localhost/v1.44",
	fetch: socketFetch,
	headers: {
		"Host": "localhost",
		"User-Agent": "robopeer-v2",
	},
});
