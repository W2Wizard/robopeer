#=============================================================================
# W2Wizard, Amsterdam @ 2018-2023
# See README and LICENSE files for details.
#=============================================================================
# Docker image for running git based repositories with bun test framework.
#=============================================================================
# TODO: Setup a runner user with very limited rights.
#=============================================================================

FROM oven/bun:latest
WORKDIR /app

RUN apt-get update && apt-get install -y \
    ksh \
    git \
    sudo \
    cmake \
    vim-common \
    clang-tidy \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --shell /bin/bash "runner"

COPY entry.sh /usr/local/bin/entry.sh
ENTRYPOINT [ "entry.sh" ]
