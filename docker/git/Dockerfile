#=============================================================================
# W2Wizard, Amsterdam @ 2024
# See README and LICENSE files for details.
#=============================================================================
# Docker image for running git based repositories with bun test framework.
#=============================================================================

FROM oven/bun:latest
WORKDIR /

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    coreutils \
    vim-common \
    clang \
    clang-tidy \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Keep the container running
COPY start.sh /usr/local/bin/init.sh
RUN chmod 755 /usr/local/bin/init.sh

RUN addgroup --gid 1337 nxtdmy
RUN adduser --shell /bin/bash runner && adduser runner nxtdmy

USER runner
ENTRYPOINT [ "init.sh" ]