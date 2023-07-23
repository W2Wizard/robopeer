//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Socket } from "bun";
import { RawRequest, ResponseParser } from "@/http";

//=============================================================================

type Receive = (socket: Socket, data: Buffer) => void | Promise<void>;

/** Function protopype used when a response is received. */
export type ResponseCallback = (res: Response) => void | Promise<void>;

//=============================================================================

/**
 * A docker socket lets you communicate with the docker daemon directly.
 * @note We won't bother with Windows support for now or ever.
 *
 * @see https://docs.docker.com/engine/api/v1.43/
 */
export default class Docker {
	public endpoint: string;

	private socket?: Socket;
	private responseListener: ResponseCallback = () => {
		console.warn("No response listener set.");
	};

	constructor(version: string = "v1.43") {
		this.endpoint = `/${version}`;
	}

	//= Private =//

	public send(request: RawRequest | BufferSource | string) {
		if (!this.socket) return 0;

		if (request instanceof RawRequest)
			return this.socket.write(request.toString());
		return this.socket.write(request);
	}

	//= Public =//

	/** Connect to the docker daemon. */
	public async connect() {
		const parser = new ResponseParser();
		const appendOrResolve = async (buffer: Buffer) => {
			parser.append(buffer);

			if (parser.isComplete) {
				await this.responseListener(parser.toResponse());
				parser.reset();
				return;
			}
		};

		try {
			this.socket = await Bun.connect({
				unix: '/var/run/docker.sock',
				socket: {
					error(_, error) { throw error; },
					connectError(_, error) { throw error; },
					data(_, data) { appendOrResolve(data) },
				}
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	/** Disconnect from the docker daemon. */
	public disconnect() {
		if (!this.socket)
			throw new Error("Not connected to docker daemon.");
		this.socket.flush();
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
		const request = new RawRequest(`${this.endpoint}/containers/json`, {
			method: "GET",
			headers: {
				"Host": "localhost",
			}
		});

		this.send(request);
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
		const request = new RawRequest(`${this.endpoint}/containers/create`, {
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
		const request = new RawRequest(`${this.endpoint}/containers/${id}/start`, {
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
		const request = new RawRequest(`${this.endpoint}/containers/${id}/stop`, {
			method: "POST",
			headers: { "Host": "localhost" }
		});

		this.send(request);
	}
}
