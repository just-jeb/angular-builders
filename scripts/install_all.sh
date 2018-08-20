#!/bin/bash

yarn

for dir in packages/*; do (
    cd "$dir"
    yarn
    if [ -e ./scripts/install.sh ]; then
        chmod +x ./scripts/install.sh
    fi
) done