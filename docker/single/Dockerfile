#=============================================================================
# W2Wizard, Amsterdam @ 2018-2023
# See README and LICENSE files for details.
#=============================================================================
# Docker image for running single code submissions.
#=============================================================================

FROM oven/bun:latest as run_stage
WORKDIR /app

RUN apt-get update && apt-get install -y \
    ksh \
    coreutils \
    vim-common \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN useradd runner --shell /bin/bash --create-home

COPY start.sh .
COPY entry.sh /usr/local/bin/entry.sh
ENTRYPOINT [ "entry.sh" ]
