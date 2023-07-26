<div align="center">
    <h1><code>Grader</code></h1>
    <sub>Written by W2Wizard</sub>
</div>
<br/>

Grader is meant as a webserver to which you can submit code and have it "graded". Basically a safe environment to run code in without having to worry about it doing anything malicious.

The main intention is to serve in a Kubernetes cluster, but it can be used standalone as well.
When in a cluster, the idea is to have multiple instances of the server running, and have a load balancer in front of them.

It is more of a proof of concept than anything else, but it is still usable. Also my personal project to work with Bun instead of
NodeJS as my runtime.

>**Warning**: This is still a work in progress, and is not ready for production use.

## Install dependencies
Requires [Bun.sh](https://bun.sh) to install dependencies.

```bash
bun install
```

## Usage (Runner)

At the moment it will only run C code as there is no configuration option to change how to handle different languages.
For the runner itself you can at the moment run it with:
```bash
bun run ./container/index.ts
```

This will "run" the runner at http://localhost:8000, you can use Postman or curl to send a POST request to it with the following body:
```json
{
    "code": "#include <stdio.h>\nint main() { printf(\"Hello World!\"); }"
}
```

If you have anything is logged to stderr or the exitcode is not 0 from either compiling or running the code, you get a 400 response.

## Usage (Server)

The server is meant to be run in a Kubernetes cluster, but can be run standalone as well.
To run it standalone you can use:
```bash
bun run ./src/main.ts
```

It will connect to the docker daemon on the host machine, so make sure that is running.
Also it will run on http://localhost:8080. This will be the main way of interfacing
with the server, and it will be the only way to submit code to be run later on.

## Docker runner

To test the runner you can build a docker image and run it with the following commands:

```bash
# Build the runner image
docker build -t runner -f ./container/Dockerfile .
```

```bash
# Execute the runner with the following tests on the following repo
docker run -v ./projects/libft:/app -e GIT_URL="https://github.com/fbescodam/libft.git" runner
```
