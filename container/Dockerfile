FROM oven/bun:latest

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY . /app
RUN bun run index.ts
