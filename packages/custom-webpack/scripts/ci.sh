#!/usr/bin/env bash

filename=custom-webpack-builder.tgz
set -e;
yarn pack --filename ${filename}

cd ./examples/sanity-app && yarn remove @angular-builders/custom-webpack
[ ! $CI ] && yarn cache clean
yarn add -D file:../../${filename}
yarn build

cd ../append-webpack-plugins && yarn remove @angular-builders/custom-webpack
[ ! $CI ] && yarn cache clean
yarn add -D file:../../${filename}
#check karma builder
yarn test --browsers=ChromeHeadlessCI
#check browser and dev-server
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js --prod


