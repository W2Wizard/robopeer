#!/bin/bash
#==============================================================================
set -e

ID=$(xxd -l 16 -ps /dev/urandom | tr -d " \n")
Dir="/tmp/$ID"
File="$dir/user.c"
Home="/home/bun/"

# Build
#==============================================================================

echo "[+] Building file..."
echo $CODE_SOURCE > $File
gcc $CODE_FLAGS $File

cp ./a.out $Home
chmod a+x $Home/a.out

# Take the $CODE_ARGS and split it by semicolon into an array
IFS=';' read -ra ARGS <<< "$CODE_ARGS"

# Run
#==============================================================================

echo "[+] Running file..."
su - bun -s /bin/bash -c "pwd; ls -l; ./a.out ${ARGS[@]}"