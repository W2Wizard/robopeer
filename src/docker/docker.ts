//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Socket } from "bun";
import { getRequestString } from "../utils";

//=============================================================================

type Receive = (socket: Socket, data: Buffer) => void | Promise<void>;

/** Function protopype used when a response is received. */
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
	private responseListener: ResponseCallback = () => {
		console.warn("No response listener set.");
	};

	constructor(version: string = "v1.43") {
		this.endpoint += `/${version}`;
	}

	/** Connect to the docker daemon. */
	public async connect() {
		// Hack to get around the fact that we can't use this in the connect
		const listener = async (data: string) => {
			const [header, body] = data.split("\r\n\r\n");
			const statusLine = header.match(/HTTP\/1.0 (\d+) (.+)/)!;
			if (!statusLine)
				throw new Error("Invalid status line received.");

			// Get the headers
			const headers = new Headers();
			const headerLines = header.split("\r\n");
			for (let i = 1; i < headerLines.length; i++) {
				const [key, value] = headerLines[i].split(": ");
				headers.set(key, value);
			}

			// Construct the response
			const [_, status, statusText] = statusLine;
			this.responseListener(new Response(body, {
				status: parseInt(status),
				statusText: statusText,
				headers: headers,
			}));
		};

		try {
			let buffer: Buffer = Buffer.alloc(0);
			this.socket = await Bun.connect({
				unix: '/var/run/docker.sock',
				socket: {
					data(socket, data) { buffer = Buffer.concat([buffer, data]); },
					end(socket) { listener(buffer.toString()); },
					connectError(socket, error) { throw error; },
				}
			});

			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	private send(request: Request | BufferSource | string) {
		if (!this.socket) return 0;
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

	/**
	 * Create a new container.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerCreate
	 */
	public createContainer(container: any, cb: ResponseCallback) {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");

		this.responseListener = cb;
		const payload = JSON.stringify(container);
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

	/**
	 * Start a container.
	 *
	 * @param id The id of the container to start.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerStart
	 */
	public startContainer(id: string, cb: ResponseCallback) {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");

		this.responseListener = cb;
		const request = new Request(`${this.endpoint}/containers/${id}/start`, {
			method: "POST",
			headers: { "Host": "localhost" }
		});

		this.send(request);
	}

	/**
	 * Stop a container.
	 *
	 * @param id The id of the container to stop.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerStop
	 */
	public stopContainer(id: string, cb: ResponseCallback) {
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
