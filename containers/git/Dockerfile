FROM oven/bun:latest

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY . /app

# NOTE(W2): Do I really want to do this?
# For now I do, because running the file directly doesn't work.
RUN bun build /app/src/main.ts --compile --outfile runner
RUN mv runner /usr/local/bin/runner && rm -rf /app
ENTRYPOINT ["runner"]
