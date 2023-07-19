
// Demonstrate how to use Bun to connect to Docker API

const socketPath = '/var/run/docker.sock';
const endpoint = '/v1.43/containers/create';

const payload = JSON.stringify({
  Image: 'node:latest',
	Name: 'bun',
  Cmd: ['tail', '-f', '/dev/null'],
});

await Bun.connect({
	unix: socketPath,
	socket: {
		data(socket, data) {
			console.log(data.toString());
			socket.end();
		},
		open(socket) {
			// Write HTTP request to a buffer to send it later
			const buffer = Buffer.from(`POST ${endpoint} HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: ${payload.length}\r\n\r\n${payload}\r\n`);
			socket.write(buffer);
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
