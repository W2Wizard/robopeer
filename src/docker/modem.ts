//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { Socket } from "bun";
import { RawRequest, ResponseParser } from "@/http";

export type ModemCB = (res: Response) => void | Promise<void>;

//=============================================================================

export default class Modem {
	public endpoint = "http://localhost/";
	private socket: Socket | null = null;
	private callback: ModemCB | null = null;

	constructor(endpoint: string = "v1.43") {
		this.endpoint += endpoint;
	}

	//= Public =//

	public get isConnected() {
		return this.socket !== null;
	}

	public async connect() {
		const parser = new ResponseParser();
		const appendOrResolve = async (buffer: Buffer) => {
			parser.append(buffer);

			if (parser.isComplete) {
				const response = parser.toResponse();
				if (this.callback)
					await this.callback(response);
				parser.reset();
			}
		};

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
				end() {
					console.log("Socket closed.");
				},
			},
		});
	}

	/**
	 * Send a request to the docker daemon.
	 * @param request The request to send.
	 * @param cb A callback that will be called when the response is received.
	 */
	public async send(request: RawRequest, cb?: ModemCB) {
		if (!this.socket) throw new Error("Not connected to docker daemon.");

		this.callback = cb || null;
		this.socket.write(request.toString());
	}
}
