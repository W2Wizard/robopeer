#!/bin/bash
#==============================================================================
if [ -z "$GIT_URL" ] || [ -z "$GIT_BRANCH" ] || [ -z "$GIT_COMMIT" ]; then
    echo -e "GIT_URL, GIT_BRANCH and GIT_COMMIT must be set"
    exit 1
fi

ID=$(xxd -l 16 -ps /dev/urandom | tr -d ' \n')
ProjectDIR="/tmp/$ID/project"
ObjectsDIR="/tmp/$ID/objects"
Home="/home/runner/"

# Functions
#==============================================================================

# Fetch the project
function gitCloneCommit() {
    echo "[+] Cloning $GIT_URL"
    timeout 10s git clone $GIT_URL $ProjectDIR -b $GIT_BRANCH --recurse-submodules --quiet
    cd $ProjectDIR

    echo "[+] Switching to $GIT_COMMIT"
    git checkout $GIT_COMMIT --quiet
    cd - > /dev/null
}

# Build the project
function build() {
    echo "[+] Building ..."
    timeout 1m make -C $ProjectDIR -j4

    rm -rf $ObjectsDIR  && mkdir -p $ObjectsDIR
    find $ProjectDIR -name "Makefile" -exec cp {} $Home \;
    find $ProjectDIR -name "*.o" -exec cp {} $ObjectsDIR \;

    gcc -shared -o $Home/libft.so $ObjectsDIR/*.o
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
