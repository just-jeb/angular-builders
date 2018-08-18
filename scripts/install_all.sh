#!/bin/bash

yarn

for dir in packages/*; do
    (cd "$dir" && yarn);
done