#!/usr/bin/env bash

filename=custom-webpack-builder.tgz
set -e;
yarn pack --filename ${filename}
cd ./examples/append-webpack-plugins && yarn remove @angular-builders/custom-webpack && yarn cache clean @angular-builders/custom-webpack && yarn add -D file:../../${filename}
yarn e2e --protractor-config=./e2e/protractor-ci.conf.js