#!/bin/bash

# This is a hack because otherwise docker complains about a missing
# /app/start.sh file which is because the volume isn't mounted yet
/bin/bash /app/start.sh
