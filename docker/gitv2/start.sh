#!/bin/bash
#=============================================================================

export ID=$(xxd -l 16 -ps /dev/urandom | tr -d ' \n')
export TMP_DIR="/tmp/$ID"
export GIT_DIR="$TMP_DIR/git"
export WRK_DIR="$HOME/app"

echo "[+] Starting..."
if [ -z "$GIT_URL" ] || [ -z "$GIT_BRANCH" ] || [ -z "$GIT_COMMIT" ]; then
    echo -e "GIT_URL, GIT_BRANCH and GIT_COMMIT must be set!"
    exit 1
fi

mkdir -p $TMP_DIR
echo "[+] Cloning $GIT_URL"
git clone $GIT_URL $GIT_DIR -b $GIT_BRANCH --recurse-submodules --quiet

echo "[+] Switching to $GIT_COMMIT"
cd $GIT_DIR
#ls -laF

echo "[+] Moving to"
pwd
git checkout $GIT_COMMIT --quiet
cd - > /dev/null

# Clean up the work directory if anything is there
# Since the host is read-only, copy the unit test files
rm -rf $WRK_DIR && mkdir -p $WRK_DIR
cp /var/dev/index.test.ts $WRK_DIR
ls -laF $WRK_DIR

echo "[+] Timeout: $TIMEOUT seconds"
timeout --kill-after=$TIMEOUT $TIMEOUT /bin/bash /var/dev/start.sh
#tail -f /dev/null

exitCode=$?
if [ $exitCode -ne 0 ]; then
    echo -e "[+] Failed: $exitCode"
else
    echo -e "[+] Success"
fi
exit $exitCode
