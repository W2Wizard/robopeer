//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import DockerSocket from "./socket";

//=============================================================================

/** Options for a docker container. */
interface ContainerOptions {

};

//=============================================================================

/** A docker container. */
export default class Container {
	public readonly id: string = "";
	public readonly image: string;
	public readonly options: ContainerOptions;

	constructor(image: string, options?: ContainerOptions) {
		this.image = image;
		this.options = options || {};
	}

	/**
	 * Creates and runs the container.
	 * @param socket The docker socket to use.
	 */
	public async start() {
		throw new Error("Not implemented.");
	}

	/** Kills the container. */
	public async kill() {
		throw new Error("Not implemented.");
	}

	/** Stops the container. */
	public async stop() {
		throw new Error("Not implemented.");
	}

	/** Converts the container to a JSON payload. */
	public asPayload() {
		return {
			Image: this.image,
			...this.options,
		};
	}
};
