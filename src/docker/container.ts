//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import Modem from "./modem";
import { Docker } from "./api";

//=============================================================================

export enum ExitCode {
	Success = 0,
	MinorError = 1,
	MajorError = 2,
	Killed = 137, // SIGKILL
	Timeout = 124, // NOTE(W2): Requires coreutils from GNU.
	ScriptFail = 127, // The script is buggy.
	NotFound = 128,
}

/** A container to run docker commands in. */
export default class Container {
	public payload: any;
	public id: string | null = null;
	private modem: Modem | null = null;

	constructor(payload: any) {
		this.payload = payload;
	}

	//= Public =//

	/** Launch the container. */
	public async launch() {
		this.modem = new Modem();
		await this.modem.connect();

		const create = (modem: Modem, container: Container) =>
			new Promise<string>((resolve, reject) => {
				Docker.create(modem, container, async (res) => {
					if (!res.ok) return reject(Error(await res.text()));

					const { Id } = (await res.json()) as { Id: string };
					return resolve(Id);
				});
			});

		const start = (modem: Modem, id: string) =>
			new Promise<string>((resolve, reject) => {
				Docker.start(modem, id, async (res) => {
					if (!res.ok) return reject(Error(await res.text()));
					return resolve(id);
				});
			});

		this.id = await create(this.modem, this);
		await start(this.modem, this.id);
		return this;
	}

	/**
	 * Wait for the container to finish.
	 *
	 * @returns The logs and exit code of the container.
	 */
	public async wait() {
		if (!this.modem || !this.id) {
			throw new Error("Container not launched.");
		}

		// Promise for the exit code.
		const waitCon = (modem: Modem, id: string) =>
			new Promise<number>((resolve, reject) => {
				Docker.wait(modem, id, async (res) => {
					if (!res.ok) return reject(Error(await res.text()));

					const { StatusCode } = (await res.json()) as any;
					return resolve(StatusCode);
				});
			});

		// Promise for the logs.
		const logsCon = (modem: Modem, id: string) =>
			new Promise<string>((resolve, reject) => {
				const params = new URLSearchParams({
					stdout: "true",
					stderr: "true",
					timestamps: "true",
				});

				Docker.getLogs(modem, id, params, async (res) => {
					if (!res.ok) return reject(Error(await res.text()));
					return resolve(Docker.parseLogBuffer(await res.arrayBuffer()));
				});
			});

		const exitCode = await waitCon(this.modem, this.id);
		const logs = await logsCon(this.modem, this.id);
		return { exitCode, logs };
	}

	public async kill() {
		if (!this.modem || !this.id) {
			throw new Error("Container not launched.");
		}

		const kill = (modem: Modem, id: string) =>
			new Promise<void>((resolve, reject) => {
				Docker.kill(modem, id, async (res) => {
					if (!res.ok) return reject(Error(await res.text()));
					return resolve();
				});
			});

		await kill(this.modem, this.id);
	}

	/** Remove the container. */
	public async remove() {
		if (!this.modem) throw new Error("Container not launched.");

		const remove = (modem: Modem, id: string) =>
			new Promise<void>((resolve, reject) => {
				Docker.remove(modem, id, async (res) => {
					if (!res.ok) return reject(Error(await res.text()));
					return resolve();
				});
			});

		await remove(this.modem, this.id!);
		this.modem.disconnect();
	}
}
