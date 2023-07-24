//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { docker } from "@/main";

export interface SandboxOptions {
	image: any;
	poolSize: number;
}

//=============================================================================

/**
 * A sandbox manages a pool of containers that can be used to grade a submission.
 * Once a container is used it is destroyed and a new one is created.
 *
 * If the pool is full, the sandbox will wait until a container is available.
 * Ideally you would want to have it balanced between multiple sandboxes.
 */
class Sandbox {
	public options: SandboxOptions;
	public containerIDs: string[] = [];

	constructor(options: SandboxOptions) {
		this.options = options;
	}

	public async submit(code: string) {

	}
}
