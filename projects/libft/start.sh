#!/bin/bash
#==============================================================================
if [ -z "$GIT_URL" ]; then
    echo "GIT_URL environment variable is not set"
    exit 1
fi

randID=$(xxd -l 16 -ps /dev/urandom | tr -d ' \n')
outputdir="/home/runner/"
workdir="/tmp/$randID/libft"
libobjs="/tmp/$randID/objects"

rm -rf $libobjs && mkdir -p $libobjs
rm -rf $workdir && mkdir -p $workdir

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
find $workdir -name "*.o" -exec cp {} $libobjs \;
gcc -shared -o $outputdir/libft.so $libobjs/*.o
cp /app/index.test.ts $outputdir

# TODO: Prevent runner from deleting ANY files that are owned by root
if ! su - runner -s /bin/rksh -c "bun test"; then
    echo -e "\e[1;31mFailed to run bun test\e[0m"
    exit 1
fi
exit 0

