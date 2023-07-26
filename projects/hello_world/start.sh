#!/bin/bash
id=$(xxd -l 16 -ps /dev/urandom | tr -d ' \n')

# Compile the code...
# Clang-Tidy it ...

bun test index.test.ts
