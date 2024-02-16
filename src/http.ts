//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

// TODO: Find something to replace this with
import { HTTPParser, HTTPParserJS } from "http-parser-js";

//=============================================================================

/**
 * This module contains functions for working with HTTP requests and responses.
 */
export namespace RawHTTP {

	/**
	 * Reads a raw HTTP request and returns it as a string.
	 * @param req 
	 * @returns 
	 */
	export async function readRequest(req: Request): Promise<string> {
		let requestString = `${req.method} ${req.url} HTTP/1.1\r\n`;
		req.headers.forEach((value, key) => {
			requestString += `${key}: ${value}\r\n`;
		});
		requestString += "\r\n";

		if (req.body) {
			requestString += await Bun.readableStreamToText(req.body);
		}

		return requestString;
	}

	/**
	 * Parses a raw HTTP response and returns it as a string.
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
				throw new Error("Could not parse");
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
}
