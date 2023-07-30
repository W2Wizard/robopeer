//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Socket } from "bun";
import { RawRequest, ResponseParser } from "@/http";

//=============================================================================

/** Function protopype used when a response is received. */
type ModemCB = (res: Response) => void | Promise<void>;

//=============================================================================

/** Docker API. */
export namespace Docker {
	/**
	 * Parse the response buffer from the docker daemon.
	 * ```md
	 * Example response from the docker daemon:
	 * 01 00 00 00 00 00 00 1f 52 6f 73 65 73 20 61 72  65 ...
	 * │  ─────┬── ─────┬─────  R  o  s  e  s     a  r   e ...
	 * │       │        │
	 * └stdout │        │
	 *         │        └─ 0x0000001f = 31 bytes (including the \n at the end)
	 *       unused
	 * ```
	 *
	 * @note Each line is always ending with a newline character.
	 * @see https://ahmet.im/blog/docker-logs-api-binary-format-explained/
	 */
	export function parseDaemonBuffer(buff: ArrayBuffer): string {
		let data = "";
		let offset = 0;
		let buffer = Buffer.from(buff);

		while (offset < buffer.length) {
			const length = buffer.readUInt32BE((offset += 4));
			const line = buffer.subarray((offset += 4), (offset += length));
			data += line.toString();
		}

		return data;
	}

	/**
	 * A docker socket lets you communicate with the docker daemon directly.
	 * @note We won't bother with Windows support for now or ever.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/
	 */
	export class Modem {
		public endpoint: string;

		private socket?: Socket;
		private callbacks: ModemCB[] = [];

		constructor(version: string = "v1.43") {
			this.endpoint = `/${version}`;
		}

		//= Public =//

		public send(request: RawRequest | BufferSource | string, cb?: ModemCB) {
			if (!this.socket) return 0;

			if (cb) this.callbacks.push(cb);
			if (request instanceof RawRequest)
				return this.socket.write(request.toString());
			return this.socket.write(request);
		}

		/** Connect to the docker daemon. */
		public async connect() {
			const parser = new ResponseParser();
			const appendOrResolve = async (buffer: Buffer) => {
				parser.append(buffer);

				if (parser.isComplete) {
					const cb = this.callbacks.shift();
					if (cb) await cb(parser.toResponse());
					parser.reset();
					return;
				}
			};

			try {
				this.socket = await Bun.connect({
					unix: "/var/run/docker.sock",
					socket: {
						error(_, error) {
							throw error;
						},
						connectError(_, error) {
							throw error;
						},
						data(_, data) {
							appendOrResolve(data);
						},
					},
				});

				return true;
			} catch (error) {
				return false;
			}
		}

		/** Disconnect from the docker daemon. */
		public disconnect() {
			if (!this.socket) throw new Error("Not connected to docker daemon.");
			this.socket.flush();
			this.socket.end();
		}

		/** Returns true if connected to the docker daemon. */
		public get isConnected() {
			return this.socket != undefined;
		}
	}

	/**
	 * List all containers.
	 * @returns A list of containers currently running as JSON.
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerList
	 */
	export function listContainers(modem: Docker.Modem, cb?: ModemCB) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const request = new RawRequest(`${modem.endpoint}/containers/json`, {
			method: "GET",
			headers: {
				Host: "localhost",
			},
		});

		modem.send(request, cb);
	}

	/**
	 * Create a new container.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerCreate
	 */
	export function createContainer(
		modem: Docker.Modem,
		container: any,
		cb?: ModemCB
	) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const payload = JSON.stringify(container);
		const request = new RawRequest(`${modem.endpoint}/containers/create`, {
			method: "POST",
			headers: {
				Host: "localhost",
				"Content-Type": "application/json",
				"Content-Length": payload.length.toString(),
			},
			body: payload,
		});

		modem.send(request, cb);
	}

	/**
	 * Start a container.
	 *
	 * @param id The id of the container to start.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerStart
	 */
	export function startContainer(
		modem: Docker.Modem,
		id: string,
		cb?: ModemCB
	) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const request = new RawRequest(`${modem.endpoint}/containers/${id}/start`, {
			method: "POST",
			headers: { Host: "localhost" },
		});

		modem.send(request, cb);
	}

	/**
	 * Stop a container.
	 *
	 * @param id The id of the container to stop.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerStop
	 */
	export function stopContainer(modem: Docker.Modem, id: string, cb?: ModemCB) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const request = new RawRequest(`${modem.endpoint}/containers/${id}/stop`, {
			method: "POST",
			headers: { Host: "localhost" },
		});

		modem.send(request, cb);
	}

	/**
	 * Wait for a container to finish.
	 * Blocks until the container stops, then returns the exit code.
	 *
	 * @param id The id of the container to wait for.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerWait
	 */
	export function waitContainer(modem: Docker.Modem, id: string, cb?: ModemCB) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const request = new RawRequest(`${modem.endpoint}/containers/${id}/wait`, {
			method: "POST",
			headers: { Host: "localhost" },
		});

		modem.send(request, cb);
	}

	/**
	 * Get the logs of a container.
	 *
	 * @param id The id of the container to get the logs from.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerLogs
	 */
	export function getLogs(
		modem: Docker.Modem,
		id: string,
		params: URLSearchParams,
		cb?: ModemCB
	) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const url = `${modem.endpoint}/containers/${id}/logs?${params.toString()}`;
		const request = new RawRequest(url, {
			method: "GET",
			headers: {
				Host: "localhost",
				Accept: "application/json",
			},
		});

		modem.send(request, cb);
	}
}
