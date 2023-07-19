//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

//=============================================================================

/** Sandbox options. */
export interface SandboxOptions {
	timeoutMs: number;
	memoryLimitMb: number;
	dockerImage: 'node:latest';
	poolSize: 1;
};

export interface SandboxCodeOptions {
	compiler?: VoidFunction;
	execution?: VoidFunction;
	args?: string[];
};

//=============================================================================

/** A sandbox for running untrusted code. */
export default class Sandbox {
	public options: SandboxOptions;

	constructor(options?: SandboxOptions) {
		this.options = options || {
			timeoutMs: 1000,
			memoryLimitMb: 128,
			dockerImage: 'node:latest',
			poolSize: 1,
		};

		const containerLaunchOptions = {
			Image: this.options.dockerImage,
			NetworkDisabled: true,
			AttachStdin: false,
			AttachStdout: false,
			AttachStderr: false,
			OpenStdin: false,
			User: "sandbox",
			Tty: false,
			HostConfig: {
				Memory: this.options.memoryLimitMb * 1024 * 1024,
				MemorySwap: -1,
				Privileged: false,
				CpusetCpus: "0",
			},
			Labels: {
				"com.w2wizard.sandbox": "1"
			},
			ExposedPorts: {
				"8080/tcp": {}
			},
		};

		//// Cleanup on exit
		//["SIGINT", "beforeExit"].map((event) => {
		//	process.on(event, () => this.cleanup());
		//});
	}

	/**
	 * Execute the given code in the sandbox.
	 * @param code The code to execute.
	 * @returns The output of the code.
	 */
	public async run(code: string, options: SandboxCodeOptions) {
		throw new Error("Not implemented");
	}

	public async cleanup() {
		throw new Error("Not implemented");
	}
}
