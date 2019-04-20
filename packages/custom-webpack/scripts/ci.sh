#!/usr/bin/env bash

filename=custom-webpack-builder.tgz
set -e;
yarn pack --filename ${filename}

#Check that it works the same way angular-devkit builders do when there is no custom webpack config provided
cd ./examples/sanity-app && yarn remove @angular-builders/custom-webpack
[ ! $CI ] && yarn cache clean
yarn add -D file:../../${filename}
yarn build
yarn test --browsers=ChromeHeadlessCI
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js

#Check scenarios with custom webpack config
cd ../append-webpack-plugins && yarn remove @angular-builders/custom-webpack
[ ! $CI ] && yarn cache clean
yarn add -D file:../../${filename}
#check karma builder
yarn test --browsers=ChromeHeadlessCI
#check browser and dev-server
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js --prod


