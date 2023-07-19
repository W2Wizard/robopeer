//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { on } from "stream";
import Container from "../docker/container";
import DockerSocket from "../docker/socket";
import { Socket } from "bun";

/**
 * Handle POST requests to /grade.
 * Grades a git repository and returns the results.
 *
 * @param git The git repository to grade.
 * @returns JSON object with the grading results.
 */
export async function POST(request: Request, url: URL): Promise<Response> {
	const docker = new DockerSocket();

	// We get a response from the docker daemon.
	const onReceive = (socket: Socket, data: Buffer) => {
		console.log(data.toString());
	};

	// We open a connection to the docker daemon and send a request.
	const onOpen = (socket: Socket) => {
		socket.write("GET /containers/json HTTP/1.1\r\n\r\n");
	};

	const connected = await docker.connect(onReceive, onOpen);
	if (!connected) {
		return new Response("Failed to connect to docker daemon.", {
			status: 500
		});
	}

	docker.disconnect();
	return new Response("Not implemented", { status: 501 });
}
