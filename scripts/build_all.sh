#!/bin/bash

for dir in packages/*; do
    (cd "$dir" && yarn build);
done