<div align="center">
    <h1><code>🤖 RoboPeer 🤖</code></h1>
    <sub>Written by W2Wizard</sub>
</div>
<br/>

RoboPeer is a **webserver** designed to grade your code in a safe environment. It allows you to submit code and have it "graded" without any worries about potential malicious activities.

This project was created using `bun init` in bun v1.1.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## 🎯 How it Works

The grading process involves comparing the output of the provided git repository (after compiling it) to a series of tests run with `bun:test`. RoboPeer then returns the results of these tests. With an appropriate status code.

RoboPeer can also grade direct code submissions via `/evaluate/git`.

- `200` - All tests passed.
- `408` - Timeout for testing.
- `422` - Skill issue (bad code)
- `500` - RoboPeer failed.

> **Warning**: RoboPeer is currently a work in progress and is not yet suitable for production use.

## 🛠️ Installation
Requires [Bun.sh](https://bun.sh) to install dependencies.

To install dependencies:
```bash
bun install
```

To run:
```bash
bun run api-get # Fetches Dockers OpenAPI spec
bun run dev
```

To build:
```bash
bun run build # Outputs JS
bun run compile # Outputs a 98~mb binary
```

## 🚀 Usage 

### Creating a Grading Project

To create a new reference project, use the following command:
```bash
bun run new < project-name >
```

### 🐳 Docker Setup

> **Note**: The docker image hasn't been configured properly yet to make sure the code isn't actually doing something stupid (deleting files, cd, ...) atm it uses Kornshell just a basic simple attempt but there are no serious measures whatsoever.

Make sure `Docker` is installed and running on your machine.
Build the Docker image:

```bash
#Git Image runner
docker build -t w2wizard/git ./docker/git
```

```bash
#Single Code runner
docker build -t w2wizard/singlke ./docker/single
```

### 📨 Sending a Grading Request
The server by default run on http://localhost:8080. To send a request to it you can use the following curl command:
```bash
# For git repositories
curl -XPOST -H "Content-type: application/json" -d '{
    "data": {
        "repo": "https://github.com/fbescodam/libft.git",
        "branch": "master",
        "commit": "67dc80a"
    }
}' 'http://localhost:3001/evaluate/git/libc'
```

```bash
# For single files
curl -XPOST -H "Content-type: application/json" -d '{
    "data": {
        "args": [],
        "content": "int main() { while(1) { fork() } }",
        "flags": [
            "-Wno-implicit-function-declaration"
        ],
        "lang": "c"
    }
}' 'http://localhost:3001/evaluate/code'
```
