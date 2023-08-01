//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import fs, { mkdirSync } from "fs";
import chalk from "chalk";

export enum LogLevel {
	INFO = "INFO",
	WARN = "WARN",
	FAIL = "FAIL",
}

//=============================================================================

/** A simple logger class that writes to a file and the console. */
class Logger {
	private logFilePath: string;

	constructor(logDirectoryPath: string) {
		mkdirSync(logDirectoryPath, { recursive: true });
		const date = new Date()
			.toLocaleString("en-GB", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.replace(",", "")
			.replace(/\//g, "-");

		this.logFilePath = `${logDirectoryPath}/log-${date}.log`;
	}

	private getCurrentTimestamp(): string {
		return new Date()
			.toLocaleString("en-GB", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			})
			.replace(",", "");
	}

	private format(level: LogLevel, message: string): string {
		return `[${this.getCurrentTimestamp()}] [${level.toString()}] ${message}`;
	}

	private writeToConsole(message: string): void {
		console.log(message);
	}

	private writeToFile(message: string): void {
		fs.appendFileSync(this.logFilePath, message + "\n");
	}

	//= Public =//

	/** Log a message to the console and the log file. */
	public write(level: LogLevel = LogLevel.INFO, ...args: unknown[]): void {
		args = args.map((arg) =>
			typeof arg === "string" ? arg : JSON.stringify(arg)
		);

		let formattedMessage = this.format(level, args.join(" "));
		this.writeToFile(formattedMessage);

		switch (level) {
			case LogLevel.INFO:
				formattedMessage = chalk.whiteBright(formattedMessage);
				break;
			case LogLevel.WARN:
				formattedMessage = chalk.yellow(formattedMessage);
				break;
			case LogLevel.FAIL:
				formattedMessage = chalk.red.bold(formattedMessage);
				break;
			default:
				break;
		}
		this.writeToConsole(formattedMessage);
	}

	/** Log a message to the console and the log file. */
	public info(...args: unknown[]): void {
		this.write(LogLevel.INFO, ...args);
	}

	/** Log a warning to the console and the log file. */
	public warn(...args: unknown[]): void {
		this.write(LogLevel.WARN, ...args);
	}

	/** Log an error to the console and the log file. */
	public error(...args: unknown[]): void {
		this.write(LogLevel.FAIL, ...args);
	}
}

export default Logger;
