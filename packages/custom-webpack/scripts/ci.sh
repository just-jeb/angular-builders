#!/usr/bin/env bash

filename=custom-webpack-builder.tgz
set -e;
yarn pack --filename ${filename}

cd ./examples/sanity-app && yarn remove @angular-builders/custom-webpack && yarn cache clean && yarn add -D file:../../${filename} && yarn new-build
cd ../append-webpack-plugins && yarn remove @angular-builders/custom-webpack && yarn cache clean && yarn add -D file:../../${filename}

#yarn new-e2e --protractor-config=./e2e/protractor-ci.conf.js
#yarn new-e2e --protractor-config=./e2e/protractor-ci.conf.js --prod

yarn new-e2e
yarn new-e2e-prod
