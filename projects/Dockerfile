#=============================================================================
# W2Wizard, Amsterdam @ 2018-2023
# See README and LICENSE files for details.
#=============================================================================
# Docker image for running git based repositories with bun test framework.
#=============================================================================

FROM oven/bun:latest
WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    clang-tidy \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY entry.sh /usr/local/bin/entry.sh
ENTRYPOINT [ "entry.sh" ]
