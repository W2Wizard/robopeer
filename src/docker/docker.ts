//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import Container from "./container";
import DockerSocket from "./socket";

/**
 * A docker socket wrapper.
 * Provides a more convenient interface to the docker daemon.
 */
export default class Docker {
	private socket: DockerSocket;
	private endpoint: string = "http://localhost";

	constructor(version: string = "v1.43") {
		this.socket = new DockerSocket();
		this.endpoint += `/${version}`;
	}

	/** Connect to the docker daemon. */
	public async connect() {
		return await this.socket.connect();
	}

	/** Disconnect from the docker daemon. */
	public disconnect() {
		this.socket.disconnect();
	}

	/**
	 * List all containers.
	 * @returns A list of containers currently running as JSON.
	 */
	public async getContainers() {
		const endpoint = `${this.endpoint}/containers/json`;
		this.socket.send(new Request(endpoint, { method: "GET" }));
	}

	public async createContainer(container: Container) {
		const endpoint = `${this.endpoint}/containers/create`;
		const payload = JSON.stringify(container.asPayload());
		const request = new Request(endpoint, {
			method: "POST",
			headers: {
				"Host": "localhost",
				"Content-Type": "application/json",
				"Content-Length": payload.length.toString(),
			},
			body: payload,
		});

		this.socket.send(request);
	}
};
