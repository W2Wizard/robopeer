// ============================================================================
// Copyright (C) 2024 W2Wizard
// See README in the root of the project for license details.
// ============================================================================

import { $ } from "bun";

// NOTE(W2): Due to docker still using Swagger 2.0, we need to convert it to OpenAPI 3.0.
await $`curl -o openapi.yaml https://docs.docker.com/reference/engine/v${Bun.env.DOCKER_VERSION ?? "1.44"}.yaml`;
await $`curl -o openapi.json https://converter.swagger.io/api/convert -H "Content-Type: application/yaml" --data-binary "@./openapi.yaml"`;
await $`bunx openapi-typescript ./openapi.json -o ./src/docker/dockerapi.d.ts`;
await $`rm openapi.yaml openapi.json`;
console.log("Docker OpenAPI types generated!");
