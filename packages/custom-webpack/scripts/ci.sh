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

cd ../../../dev-server
yarn build
filename=dev-server-builder.tgz
yarn pack --filename ${filename}

cd ../custom-webpack/examples/append-webpack-plugins && yarn remove @angular-builders/dev-server
[ ! $CI ] && yarn cache clean
yarn add -D file:../../../dev-server/${filename}

yarn e2e --protractor-config=./e2e/protractor-ci.conf.js
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js --prod

cd ../sanity-app && yarn build

