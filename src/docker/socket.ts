//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Socket } from "bun";
import { getRequestString } from "../utils";

// Function call back for open
export type SocketOpenHandle = (socket: Socket) => void;

// Function call back for data
export type SocketDataHandle = (socket: Socket, data: Buffer) => void;

//TODO: Improve API interface, this is a bit wonky and silly.
//=============================================================================

/**
 * A docker socket lets you communicate with the docker daemon directly.
 * @note We won't bother with Windows support for now or ever.
 *
 * @see https://docs.docker.com/engine/api/v1.43/
 */
export default class DockerSocket {
	private socketPath: string;
	private socket?: Socket;

	constructor(socket: string = '/var/run/docker.sock') {
		this.socketPath = socket;
	}

	/**
	 * Send a request to the docker daemon. Needs to be connected first.
	 * Additionally needs to be formatted as a valid HTTP request.
	 *
	 * @param data The request to send.
	 */
	public send(data: Request | BufferSource | string) {
		if (!this.socket) {
			throw new Error("Not connected to docker daemon.");
		}

		if (data instanceof Request) {
			this.socket.write(getRequestString(data));
		} else {
			this.socket.write(data);
		}
	}

	/** Connect to the docker socket. */
	public async connect(onReceive?: SocketDataHandle, onOpen?: SocketOpenHandle) {
		try {
			this.socket = await Bun.connect({
				unix: this.socketPath,
				socket: {
					open(socket) { if (onOpen) { onOpen(socket); } },
					data(socket, data) { if (onReceive) { onReceive(socket, data); } },
					connectError(socket, error) { throw error; },
				}
			});

			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	};

	/** Disconnect from the docker socket. */
	public disconnect() {
		if (this.socket) {
			this.socket.end();
		}
	}
}

