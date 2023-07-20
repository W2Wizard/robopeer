
// Demonstrate how to use Bun to connect to Docker API

const socketPath = '/var/run/docker.sock';
const endpoint = '/v1.43/containers/json';

const payload = JSON.stringify({
  Image: 'node:latest',
	Name: 'bun',
  Cmd: ['tail', '-f', '/dev/null'],
});

let chunks: Buffer = Buffer.alloc(0);
await Bun.connect({
	unix: socketPath,
	socket: {
		data(socket, data) {
			// Write a http 1.1 response parser that correctly handles chunked responses

		},
		handshake(socket) {
			console.log('handshake');
		},
		open(socket) {
			// Send a HEAD request to the docker daemon to check if it's alive
			//const buffer = Buffer.from(`HEAD ${endpoint} HTTP/1.1\r\nHost: localhost\r\n\r\n`);
			//socket.write(buffer);

			// Get the containers
			const buffer = Buffer.from(`GET ${endpoint} HTTP/1.1\r\nHost: localhost\r\n\r\n`);
			socket.write(buffer);

			// Write HTTP request to a buffer to send it later
			//const buffer = Buffer.from(`POST ${endpoint} HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: ${payload.length}\r\n\r\n${payload}\r\n`);
			//socket.write(buffer);
		},
		error(socket, error) {
			console.log(error);
		},
		connectError(socket, error) {
			console.log(error);
		},
		close(socket) {
			console.log('close');
		}
	}
});
