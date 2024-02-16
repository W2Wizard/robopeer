//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { docker } from "./docker";
import type { operations } from "./types/docker";

export enum ExitCode {
	Success = 0,
	MinorError = 1,
	MajorError = 2,
	Killed = 137, // SIGKILL
	Timeout = 124, // NOTE(W2): Requires coreutils from GNU.
	NotFound = 128,
}

export type ContainerInit = operations["ContainerCreate"]["parameters"]["body"]["body"];

//=============================================================================

/** A container to run docker commands in. */
export default class Container {
	public payload: any;
	public id: string | null = null;

	constructor(payload: any) {
		this.payload = payload;
	}

	//= Public =//

	/** Launch the container. */
	public async launch() {
		const { response, data, error } = await docker.POST("/containers/create", {
			body: this.payload,
			params: {
				body: {
					body: this.payload
				}
			}
		});

		console.log("response", response, await response.text());

		if (!response.ok) {
			const { status, statusText } = response;
			throw `Failed to create container: ${status} ${statusText}`;
		}


		// if (!apiCreate.response.ok) {
		// 	const { status, statusText } = apiCreate.response;
		// 	throw `Failed to create container: ${status} ${apiCreate.error ?? statusText}`;
		// }


		return this;
	}

	/**
	 * Wait for the container to finish.
	 *
	 * @returns The logs and exit code of the container.
	 */
	public async wait() {
		return { exitCode: ExitCode.Success, logs: "NaN" };
	}

	public async kill() {

	}

	/** Remove the container. */
	public async remove() {

	}
}