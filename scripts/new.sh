#!/bin/bash
#===============================================================================
# Set up a new project directory with a basic directory structure and files.

dir="./projects/$1"
if [ -z "$1" ]; then
    echo "Usage: new.sh <project_name>"
    exit 1
fi
if [ -d "$dir" ]; then
    echo "Project $1 already exists in $dir"
    exit 1
fi


test_template="
//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { describe, expect, it } from \"bun:test\";

//=============================================================================

describe(\"hello_world\", () => {
    it(\"output equals\", () => {
        expect(true).toBe(true);
    });
});
"

script_template="
#!/bin/bash
#===============================================================================

bun test
"

mkdir -p "$dir" && cd "$dir"
echo "$script_template" > start.sh
echo "$test_template" > index.test.ts
echo "New project $1 created in $dir"
chmod +x start.sh
