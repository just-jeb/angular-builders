#!/usr/bin/env bash
filename=jest-builder.tgz
set -e;
yarn pack --filename ${filename}
cd ./examples/simple-app && yarn remove @angular-builders/jest && yarn cache clean @angular-builders/jest && yarn add -D file:../../${filename}
yarn test
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js
cd ../multiple-apps && yarn remove @angular-builders/jest && yarn cache clean @angular-builders/jest && yarn add -D file:../../${filename}
yarn test
yarn e2e --configuration=ci
