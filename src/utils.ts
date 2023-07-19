//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

/**
 * Get a string representation of a request.
 * @param request The request to get the string representation of.
 * @returns The string representation of the request.
 */
export function getRequestString(request: Request) {
	const { method, url, headers } = request;

	// TODO: Add support for possible other HTTP versions.

	// NOTE: HTTP/1.0 is used because 1.1 has chunked encoding
	// which is a bit more complicated to implement.
	let requestString = `${method} ${url} HTTP/1.0\r\n`;
	headers.forEach((value, key) => {
		requestString += `${key}: ${value}\r\n`;
	});

	requestString += '\r\n';
	return requestString;
}
