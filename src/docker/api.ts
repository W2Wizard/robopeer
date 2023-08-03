//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import Container from "./container";
import { RawRequest } from "@/http";
import Modem, { ModemCB } from "./modem";

//=============================================================================

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
	export function parseLogBuffer(inBuff: ArrayBuffer): string {
		let data = "";
		let offset = 0;
		const buffer = Buffer.from(inBuff);

		while (offset < buffer.length) {
			const length = buffer.readUInt32BE((offset += 4));
			const line = buffer.subarray((offset += 4), (offset += length));
			const spacePos = line.indexOf(" ");

			// Some formatting of the timestamp.
			// WARNING(W2): Will cause bugs if we request logs without timestamps.
			const message = line.subarray(spacePos + 1);
			const date = line.subarray(0, spacePos).subarray(0, 19);
			date.set([32], date.indexOf("T"));
			data += `[${date}] ${message}`;
		}

		return data;
	}

	/**
	 * List all containers.
	 * @returns A list of containers currently running as JSON.
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerList
	 */
	export function list(modem: Modem, cb?: ModemCB) {
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
	export function create(modem: Modem, container: Container, cb?: ModemCB) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const payload = JSON.stringify(container.payload);
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
	export function start(modem: Modem, id: string, cb?: ModemCB) {
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
	export function stop(modem: Modem, id: string, cb?: ModemCB) {
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
	export function wait(modem: Modem, id: string, cb?: ModemCB) {
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
		modem: Modem,
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

	/**
	 * Remove a container.
	 *
	 * @param id The id of the container to remove.
	 * @param cb A callback that will be called when the response is received.
	 *
	 * @see https://docs.docker.com/engine/api/v1.43/#operation/ContainerDelete
	 */
	export function remove(modem: Modem, id: string, cb?: ModemCB) {
		if (!modem.isConnected) throw new Error("Not connected to docker daemon.");

		const request = new RawRequest(`${modem.endpoint}/containers/${id}`, {
			method: "DELETE",
			headers: { Host: "localhost" },
		});

		modem.send(request, cb);
	}
}
