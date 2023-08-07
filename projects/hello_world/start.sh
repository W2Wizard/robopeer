#!/bin/bash
#==============================================================================
ID=$(xxd -l 16 -ps /dev/urandom | tr -d " \n")
ProjectDIR="/tmp/$ID/project"
ObjectsDIR="/tmp/$ID/objects"
Home="/home/runner/"

# Functions
#==============================================================================

# Fetch the project
function gitCloneCommit() {
    echo "[+] Cloning $GIT_URL"
    git clone $GIT_URL $ProjectDIR -b $GIT_BRANCH --recurse-submodules --quiet
    cd $ProjectDIR

    echo "[+] Switching to $GIT_COMMIT"
    git checkout $GIT_COMMIT --quiet
    cd - > /dev/null
}

# Build the project
function build() {
    echo "[+] Building ..."
    make -C $ProjectDIR -j4

    # Other steps ...

    cp /app/index.test.ts $Home
}

# Run the tests
function run()  {
    echo "[+] Running tests ..."
    su - runner -s /bin/rksh -c "bun test"
}

# Main
#==============================================================================
set -e

gitCloneCommit
build
run


