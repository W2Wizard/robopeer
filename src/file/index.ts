//=============================================================================
// W2Wizard, Amsterdam @ 2024
// See README and LICENSE files for details.
//=============================================================================

import type { FileBody } from "../types/general";
import type { operations } from "../types/docker";

//=============================================================================

type Container = operations["ContainerCreate"]["parameters"]["body"]["body"];

export function payload(request: FileBody): Container {
	return {
		Image: "w2wizard/file",
		NetworkDisabled: true,
		AttachStdin: false,
		AttachStdout: false,
		AttachStderr: false,
		OpenStdin: false,
		Tty: false,
		HostConfig: {
			AutoRemove: false,
			Memory: 50 * 1024 * 1024, // ~50MB
			MemorySwap: -1,
			Privileged: false,
			CpusetCpus: "0", // only use one core
		},
		Env: [
			`TIMEOUT=20s`,
			`CODE_ARGS=${request.data.args.join(" ")}`,
			`CODE_FLAGS=${request.data.flags.join(" ")}`,
			`CODE_SOURCE=${request.data.content}`,
			`CODE_LANGUAGE=${request.data.lang}`,
			...Object.entries(request.envs).map(([key, value]) => `${key}=${value}`),
		],
	};
}

//=============================================================================

export function execFile(req: Request, body: FileBody) {


	return new Response("Not implemented", { status: 501 });
}
