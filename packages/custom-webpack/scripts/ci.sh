#!/usr/bin/env bash

filename=custom-webpack-builder.tgz
set -e;
yarn pack --filename ${filename}

cd ./examples/append-webpack-plugins && yarn remove @angular-builders/custom-webpack
[ ! $CI ] && yarn cache clean
yarn add -D file:../../${filename}

cd ../sanity-app && yarn remove @angular-builders/custom-webpack
[ ! $CI ] && yarn cache clean
yarn add -D file:../../${filename}

cd ../sanity-app && yarn build

yarn new-e2e
yarn new-e2e-prod
