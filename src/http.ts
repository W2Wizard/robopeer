//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { HTTPParser, HTTPParserJS } from "http-parser-js";

//=============================================================================

/**
 * A mirror class of the Request class but instead its used to build the string
 * representation of the request.
 */
export class RawRequest {
	public url: string;
	public method?: string;
	public headers?: Headers;
	public body?: string;

	constructor(url: string, options: RequestInit) {
		this.url = url;
		this.method = options.method!;
		this.headers = new Headers(options.headers);
		if (options.body) {
			this.body = options.body.toString();
		}
	}

	/** Returns the string representation of the request. */
	public toString() {
		let requestString = `${this.method} ${this.url} HTTP/1.1\r\n`;

		if (this.headers)
			for (const [name, value] of this.headers.entries())
				requestString += `${name}: ${value}\r\n`;

		requestString += '\r\n';
		return this.body ? requestString + this.body : requestString;
	}
}

//=============================================================================

/**
 * Wrapper class for the HTTP response parser.
 *
 * @note Handles trailers as well but they are not exposed.
 * @see http://npmjs.com/package/http-parser-js
 */
export class ResponseParser {
	private parser: HTTPParserJS;
	private complete: boolean;
	private statusCode?: number;
	private statusMessage?: string;
	private headers: string[] = [];
	private trailers: string[] = [];
	private bodyChunks: Buffer[] = [];

	constructor() {
		this.parser = new HTTPParser(HTTPParser.RESPONSE);
		this.complete = false;

		const { parser } = this;
		parser.onHeadersComplete = (res) => {
			this.statusCode = res.statusCode;
			this.statusMessage = res.statusMessage;
			this.headers = res.headers;
		};

		parser.onBody = (chunk, offset, length) => {
			this.bodyChunks.push(chunk.subarray(offset, offset + length));
		};

		parser.onHeaders = (t) => {
			this.trailers = t;
		};

		parser.onMessageComplete = () => {
			this.complete = true;
		};
	}

	//= Public =//

	/** Reset the parser to its initial state. */
	public reset(): void {
		this.complete = false;
		this.statusCode = undefined;
		this.statusMessage = undefined;
		this.headers = [];
		this.trailers = [];
		this.bodyChunks = [];
		this.parser.reinitialize(HTTPParser.RESPONSE);
	}

	/** Append a chunk of data to the parser. */
	public append(data: Buffer): void {
		this.parser.execute(data);
		this.parser.finish();
	}

	/** Returns true if the parser has received the entire response. */
	public get isComplete(): boolean {
		return this.complete;
	}

	/** Returns the parsed response. */
	public toResponse(): Response {
		if (!this.complete) {
			throw new Error('Could not parse');
		}

		const body = Buffer.concat(this.bodyChunks);
		return new Response(body, {
			status: this.statusCode,
			statusText: this.statusMessage,
			headers: this.toHeaders(this.headers),
		});
	}

	//= Private =//

	private toHeaders(headers: string[]): Headers {
		const result = new Headers();
		for (let i = 0; i < headers.length; i += 2)
			result.append(headers[i], headers[i + 1]);
		return result;
	}
}
