//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Socket } from "bun";
import { getRequestString } from "../utils";

//=============================================================================

type Receive = (socket: Socket, data: Buffer) => void | Promise<void>;
export type ResponseCallback = (res: Response) => void;

//=============================================================================

/**
 * A docker socket lets you communicate with the docker daemon directly.
 * @note We won't bother with Windows support for now or ever.
 *
 * @see https://docs.docker.com/engine/api/v1.43/
 */
export default class Docker {
	private socket?: Socket;
	private endpoint: string = "http://localhost";
	private responseListener: ResponseCallback = () => {};

	constructor(version: string = "v1.43") {
		this.endpoint += `/${version}`;
	}

	/** Connect to the docker daemon. */
	public async connect() {
		// Hack to get around the fact that we can't use this in the connect
		const listener = (socket: Socket, data: Buffer) => {
			this.responseListener(new Response(data));
		};

		try {
			this.socket = await Bun.connect({
				unix: '/var/run/docker.sock',
				socket: {
					data(socket, data) { listener(socket, data); },
					connectError(socket, error) { throw error; },
				}
			});

			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	private async send(request: Request | BufferSource | string) {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");
		if (request instanceof Request)
			return this.socket.write(getRequestString(request));
		return this.socket.write(request);
	}

	/** Disconnect from the docker daemon. */
	public disconnect() {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");
		this.socket.end();
	}

	/**
	 * List all containers.
	 * @returns A list of containers currently running as JSON.
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerList
	 */
	public listContainers(cb: ResponseCallback) {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");

		this.responseListener = cb;
		this.send(new Request(`${this.endpoint}/containers/json`, {
			method: "GET",
			headers: { "Host": "localhost" }
		}));
	}

	public createContainer(cb: ResponseCallback) {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");

		this.responseListener = cb;
		const payload = JSON.stringify({
			Image: 'node:latest',
			Name: 'bun',
			Cmd: ['tail', '-f', '/dev/null'],
		});

		const request = new Request(`${this.endpoint}/containers/create`, {
			method: "POST",
			headers: {
				"Host": "localhost",
				"Content-Type": "application/json",
				"Content-Length": payload.length.toString(),
			},
			body: payload,
		});

		this.send(request);
	}

	public async stopContainer(id: number, cb: ResponseCallback) {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");

		this.responseListener = cb;
		const request = new Request(`${this.endpoint}/containers/${id}/stop`, {
			method: "POST",
			headers: { "Host": "localhost" }
		});

		this.send(request);
	}
}
