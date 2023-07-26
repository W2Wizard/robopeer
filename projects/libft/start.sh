#!/bin/bash
#==============================================================================
if [ -z "$GIT_URL" ]; then
    echo "GIT_URL environment variable is not set"
    exit 1
fi

randID=$(xxd -l 16 -ps /dev/urandom | tr -d ' \n')
workdir=/tmp/$randID/libft
libobjs="/tmp/$randID/objects"

# Clone the repo and compile the library
git clone $GIT_URL $workdir --recurse-submodules
if ! make -C $workdir -j4 || [ ! -f $workdir/libft.a ]; then
    echo -e "\e[1;31mFailed to compile libft\e[0m"
    exit 1
fi

# NOTE(W2):
#==============================================================================
# For now this is my first solution and this is more of a demo script
# than a production ready script.

# Get all the *.o files from the workdir and move it to decompliePath
rm -rf $libobjs && mkdir -p $libobjs
find $workdir -name "*.o" -exec cp {} $libobjs \;

# Compile all the *.o files in the libobjs to a shared library
gcc -shared -o /app/libft.so $libobjs/*.o
bun test
