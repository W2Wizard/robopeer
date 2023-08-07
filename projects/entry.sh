#!/bin/bash
#=============================================================================

echo "[+] Starting..."
if [ -z "$GIT_URL" ] || [ -z "$GIT_BRANCH" ] || [ -z "$GIT_COMMIT" ]; then
    echo -e "GIT_URL, GIT_BRANCH and GIT_COMMIT must be set"
    exit 1
fi

# See: https://www.gnu.org/software/coreutils/manual/html_node/timeout-invocation.html#timeout-invocation
echo "[+] Timeout: $TIMEOUT seconds"
timeout --kill-after=$TIMEOUT $TIMEOUT /bin/bash /app/start.sh

exitCode=$?
if [ $exitCode -ne 0 ]; then
    echo -e "[+] Failed: $exitCode"
else
    echo -e "[+] Success"
fi
exit $exitCode
