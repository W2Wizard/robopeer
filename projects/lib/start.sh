#!/bin/bash
#==============================================================================

# Exported variables from container:
# - ID = A unique identifier for the runner
# - TMP_DIR = A temporary directory for the runner
# - GIT_DIR = The directory where the repository is cloned
# - WRK_DIR = The directory where the tests are run

OBJ_DIR="$TMP_DIR/obj"

#==============================================================================

# Build the project
function build() {
    echo "[+] ============================================================================"
    echo "[+] Building ..."
    make -C $GIT_DIR -j4

    rm -rf $OBJ_DIR && mkdir -p $OBJ_DIR
    find $GIT_DIR -name "Makefile" -exec cp {} $WRK_DIR \;
    find $GIT_DIR -name "*.o" -exec cp {} $OBJ_DIR \;

    # Build into a shared library for dlopen
    cc -shared -o $WRK_DIR/libft.so $OBJ_DIR/*.o
}

# Run the tests
function run()  {
    build
    echo "[+] ============================================================================"
    echo "[+] Running tests ..."
    cd $WRK_DIR && ls -laF && bun test
}

set -e
run