export function getRequestString(request: Request) {
  const { method, url, headers } = request;

	// TODO: Add support for possible other HTTP versions.
  let requestString = `${method} ${url} HTTP/1.1\r\n`;
  headers.forEach((value, key) => {
    requestString += `${key}: ${value}\r\n`;
  });

  requestString += '\r\n';
  return requestString;
}
