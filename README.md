<div align="center">
    <h1><code>Grader</code></h1>
    <sub>Written by W2Wizard</sub>
</div>
<br/>

Grader is meant as a webserver to which you can submit code and have it "graded". Basically a safe environment to run code in without having to worry about it doing anything malicious.

The grading works by comparing the output of the provided git repo (after compiling it) to a series of test ran with `bun:test`, and then returning the results.

Since [bun](https://bun.sh) also provides [FFI](https://bun.sh/docs/api/ffi) capabilities, making it really convenient to test things like a library and execute the tests directly with TypeScript.

It is more of a proof of concept than anything else, but it is still usable. Also my personal project to work with Bun instead of
NodeJS as my runtime.

>**Warning**: This is still a work in progress, and is not ready for production use.

>**Note**: As of now grader will only focus on testing C, but it is possible to extend it to other languages.

## Install dependencies
Requires [Bun.sh](https://bun.sh) to install dependencies.

```bash
bun install
```

## Usage (Server)

### Docker setup
Make sure docker is installed and running on your machine.
First you need to build the docker image:
```bash
docker build -t w2wizard/runner ./projects/
```

### Running the server
```bash
bun run ./src/main.ts
```

`Output`:
```
Registering /grade routes.
Connected to docker daemon.
Webserver: http://localhost:8000/
```

### Sending grading request

The server by default run on http://localhost:8080. To send a request to it you can use the following curl command:
```bash
curl -XPOST -H "Content-type: application/json" -d '{
    "branch": "master",
    "gitURL": "https://github.com/fbescodam/libft.git",
    "commit": "67dc80ae6a5d2c56a4305f5194672fe19130e705"
}' 'http://localhost:8000/api/grade/git/libft'
```

`Output`: 
```
41b7cc16874dae531b6d4e35a36622fd955d9700a1664f491f9ff2464add48eb
```

Any errors will be returned in the response body, that is, if the container reports some sort of error or the code fails to compile, etc etc.
