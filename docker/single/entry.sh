#!/bin/bash
#=============================================================================

echo "[+] Starting..."
if [ -z "$CODE_LANGUAGE" ] || [ -z "$TIMEOUT" ]; then
    echo -e "CODE_LANGUAGE and TIMEOUT must be set"
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
