//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import Modem from "./modem";
import { Docker } from "./api";

interface Wait {
	exitCode: number;
	logs: string;
}

//=============================================================================

/** A container to run docker commands in. */
export default class Container {
	public payload: any;
	public id: string | null = null;
	private modem: Modem | null = null;

	constructor(payload: any) {
		this.payload = payload;
	}

	//= Public =//

	public async launch() {
		this.modem = new Modem();
		await this.modem.connect();

		const create = (modem: Modem, container: Container) =>
			new Promise<string>((resolve, reject) => {
				Docker.create(modem, container, async (res) => {
					if (!res.ok) return reject(await res.json());

					const { Id } = (await res.json()) as { Id: string };
					return resolve(Id);
				});
			});

		const start = (modem: Modem, id: string) =>
			new Promise<string>((resolve, reject) => {
				Docker.start(modem, id, async (res) => {
					if (!res.ok) return reject(await res.json());
					return resolve(id);
				});
			});

		try {
			this.id = await create(this.modem, this);
			await start(this.modem, this.id);
			return null;
		} catch (error) {
			return error as Error;
		}
	}

	/**
	 * Wait for the container to finish.
	 *
	 * @returns The logs and exit code of the container.
	 */
	public async wait(): Promise<[Wait | null, Error | null]> {
		if (!this.modem || !this.id) {
			return [null, new Error("Container not launched.")];
		}

		// Promise for the exit code.
		const waitCon = (modem: Modem, id: string) =>
			new Promise<number>((resolve, reject) => {
				Docker.wait(modem, id, async (res) => {
					if (!res.ok) return reject(await res.json());

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
					if (!res.ok) return reject(await res.json());
					return resolve(Docker.parseLogBuffer(await res.arrayBuffer()));
				});
			});

		try {
			const exitCode = await waitCon(this.modem, this.id);
			const logs = await logsCon(this.modem, this.id);

			return [{ exitCode, logs }, null];
		} catch (error) {
			return [null, error as Error];
		}
	}

	public async remove() {
		if (!this.modem) throw new Error("Container not launched.");

		const remove = (modem: Modem, id: string) =>
			new Promise<void>((resolve, reject) => {
				Docker.remove(modem, id, async (res) => {
					if (!res.ok) return reject();
					return resolve();
				});
			});

		await remove(this.modem, this.id!);
	}

	//= Private =//

	private async connect() {}
}
