#!/bin/bash
if [ -z "$GIT_URL" ]; then
    echo "GIT_URL environment variable is not set"
    exit 1
fi

randID=$(xxd -l 16 -ps /dev/urandom | tr -d ' \n')
workdir=/tmp/libft

# Clone the repo and compile the library
git clone $GIT_URL $workdir --recurse-submodules
if [ $(make -C $workdir -j4) -ne 0 ]; then
    echo "Failed to compile libft"
    exit 1
fi

# Where we unarchive the library
decompilePath="/tmp/decompiled"
mkdir -p $decompilePath
mv $workdir/libft.a $decompilePath

# Decompile it and recompile it as a shared library
cd $decompilePath
ar -x libft.a
gcc -shared *.o -o libft.so
mv libft.so /app

bun test /app
