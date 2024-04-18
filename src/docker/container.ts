//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { docker } from "./api";
import type { components, operations } from "./dockerapi";

// export enum ExitCode {
// 	Success = 0,
// 	MinorError = 1,
// 	MajorError = 2,
// 	Killed = 137, // SIGKILL
// 	Timeout = 124, // NOTE(W2): Requires coreutils from GNU.
// 	NotFound = 128,
// }

export type ContainerPayload = operations["ContainerCreate"]["requestBody"]["content"]["application/json"];

//=============================================================================

/** A container to run docker commands in. */
export default class Container {
	public id: string | null = null;
	private payload: ContainerPayload;

	constructor(payload: ContainerPayload) {
		this.payload = payload;
	}

	//= Public =//

	/** Create the container. */
	public async create() {
		const { response, data, error } = await docker.POST("/containers/create", {
			body: this.payload,
		});

		if (error) {
			throw new Error(error.message);
		} else if (!response.ok) {
			throw new Error(response.statusText);
		}

		this.id = data.Id;
	}

	/** Start the container. */
	public async start() {
		if (!this.id) {
			await this.create();
		}

		const { response, error } = await docker.POST("/containers/{id}/start", {
			params: { path: { id: this.id! } },
		});

		if (error) {
			throw new Error(error.message);
		} else if (!response.ok) {
			throw new Error(response.statusText);
		}
	}

	/** Get the logs of the container. */
	public async logs() {
		if (!this.id) {
			throw new Error("Container not created.");
		}

		const { response, data, error } = await docker.GET("/containers/{id}/logs", {
			parseAs: "arrayBuffer",
			params: {
				query: {
					stdout: true,
					stderr: true,
					timestamps: true,
				},
				path: { id: this.id }
			},
		});

		if (error) {
			throw new Error(error.message);
		} else if (!response.ok) {
			throw new Error(response.statusText);
		}

		return data;
	}

	/**
	 * Wait for the container to finish.
	 *
	 * @returns The logs and exit code of the container.
	 */
	public async wait() {
		if (!this.id) {
			throw new Error("Container not created.");
		}

		const { response, data, error } = await docker.POST("/containers/{id}/wait", {
			params: { path: { id: this.id } },
		});

		if (error) {
			throw new Error(error.message);
		} else if (!response.ok) {
			throw new Error(response.statusText);
		}

		return data.StatusCode;
	}

	/** Kill the container. */
	public async kill() {
		if (!this.id) {
			throw new Error("Container not created.");
		}

		const { response, error } = await docker.POST("/containers/{id}/kill", {
			params: { path: { id: this.id } },
		});

		if (error) {
			throw new Error(error.message);
		} else if (!response.ok) {
			throw new Error(response.statusText);
		}
	}

	/** Remove the container. */
	public async remove() {
		if (!this.id) {
			throw new Error("Container not created.");
		}

		const { response, error } = await docker.DELETE("/containers/{id}", {
			params: { path: { id: this.id } },
		});

		if (error) {
			throw new Error(error.message);
		} else if (!response.ok) {
			throw new Error(response.statusText);
		}
	}
}
