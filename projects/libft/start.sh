#!/bin/bash
#==============================================================================
if [ -z "$GIT_URL" ] || [ -z "$GIT_BRANCH" ] || [ -z "$GIT_COMMIT" ]; then
    echo -e "GIT_URL, GIT_BRANCH and GIT_COMMIT must be set"
    exit 1
fi

randID=$(xxd -l 16 -ps /dev/urandom | tr -d ' \n')
outputdir="/home/runner/"
workdir="/tmp/$randID/libft"
libobjs="/tmp/$randID/objects"

rm -rf $libobjs && mkdir -p $libobjs
rm -rf $workdir && mkdir -p $workdir

# Clone the repo and compile the library
git clone $GIT_URL $workdir --recurse-submodules -b $GIT_BRANCH
# TODO: Checkout the commit
#git --work-tree=$workdir --git-dir=$workdir/.git checkout $GIT_COMMIT
if ! make -C $workdir -j4 || [ ! -f $workdir/libft.a ]; then
    echo -e "Failed to compile libft"
    exit 1
fi

# NOTE(W2):
#==============================================================================
# For now this is my first solution and this is more of a demo script
# than a production ready script.

# Get all the *.o files from the workdir and move it to decompliePath

# Find recursively all the *.o files in the workdir
find $workdir -name "*.o" -exec cp {} $libobjs \;
find $workdir -name "Makefile" -exec cp {} $outputdir \;
gcc -shared -o $outputdir/libft.so $libobjs/*.o
cp /app/index.test.ts $outputdir

# TODO: Prevent runner from deleting ANY files that are owned by root
if ! su - runner -s /bin/rksh -c "bun test"; then
    echo -e "Failed to run bun test"
    exit 1
fi
exit 0

