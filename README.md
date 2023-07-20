<div align="center">
    <h1><code>Grader</code></h1>
    <sub>Written by W2Wizard</sub>
</div>
<br/>

Grader is meant as a webserver to which you can submit code and have it "graded". Basically a safe environment to run code in without having to worry about it doing anything malicious.

The main intention is to serve in a Kubernetes cluster, but it can be used standalone as well.
When in a cluster, the idea is to have multiple instances of the server running, and have a load balancer in front of them.

## Install dependencies
Requires [Bun.sh](https://bun.sh) to install dependencies.

```bash
bun install
bun run ./src/main.ts
```
