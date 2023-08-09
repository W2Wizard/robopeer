<div align="center">
    <h1><code>🧪 Grader 🧪</code></h1>
    <sub>Written by W2Wizard</sub>
</div>
<br/>

Grader is a **webserver** designed to grade your code in a safe environment. It allows you to submit code and have it "graded" without any worries about potential malicious activities.

## 🎯 How it Works

The grading process involves comparing the output of the provided git repository (after compiling it) to a series of tests run with `bun:test`. Grader then returns the results of these tests. With an appropriate status code.

- `200` - All tests passed.
- `400` - Compilation failed.
- `408` - Timeout for testing.
- `500` - Grader failed.

> **Warning**: Grader is currently a work in progress and is not yet suitable for production use.

## 🛠️ Installation
Requires [Bun.sh](https://bun.sh) to install dependencies.

```bash
bun install
```

## 🚀 Usage 

### Creating a Grading Project

To create a new reference project, use the following command:
```bash
bun run new < project-name >
```

### Dashboard

To view the dashboard, just visit [localhost](http://localhost:8000/) in your browser.
The dashboard merely displays statistics about the grading server itself and not much else.

### 🐳 Docker Setup

> **Note**: The docker image hasn't been configured properly yet to make sure the code isn't actually doing something stupid (deleting files, cd, ...) atm it uses Kornshell just a basic simple attempt but there are no serious measures whatsoever.

Make sure `Docker` is installed and running on your machine.
Build the Docker image:

```bash
docker build -t w2wizard/runner ./projects/
```
### 🧰 Running the Server
Use the following command to run the server:
```bash
bun run start
# or
bun run ./src/main.ts
# or
bun build ./src/main.ts --compile --outfile grader
```
`Output`:
```
Registering /grade routes.
Connected to docker daemon.
Webserver: http://localhost:8000/
```

---

### 📨 Sending a Grading Request
The server by default run on http://localhost:8080. To send a request to it you can use the following curl command:
```bash
curl -XPOST -H "Content-type: application/json" -d '{
    "branch": "master",
    "gitURL": "https://github.com/fbescodam/libft.git",
    "commit": "67dc80ae6a5d2c56a4305f5194672fe19130e705"
}' 'http://localhost:8000/api/grade/git/libft'
```

`Output`: 
```bash
#Client
[+] Cloning git repository...
[+] Checking out commit 67dc80ae6a5d2c56a4305f5194672fe19130e705...
[+] Compiling code...
...
[+] Running tests...
```

```bash
#Server
[03/08/2023 14:33:47] [INFO] 📝 : Received request for: libft
[03/08/2023 14:33:47] [INFO] 📝 : Running tests for: libft => {"gitURL":"https://github.com/fbescodam/libft.git","branch":"master","commit":"67dc80ae6a5d2c56a4305f5194672fe19130e705"}
[03/08/2023 14:33:47] [INFO] 📝 : Container 8c2de65dcd4f exited with: 1
```
