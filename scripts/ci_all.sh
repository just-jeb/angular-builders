#!/bin/bash
set -e;
for dir in packages/*; do (
    cd "$dir"
    yarn build
    if [ -e ./scripts/ci.sh ]; then
        chmod +x ./scripts/ci.sh
        ./scripts/ci.sh
    fi
) done
