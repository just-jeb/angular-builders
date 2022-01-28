#!/usr/bin/env bash

#Check that it works the same way angular-devkit builders do when there is no custom webpack config provided
cd ../../examples/custom-webpack/sanity-app
yarn test --browsers=ChromeHeadlessCI
yarn e2e # no custom config at all
yarn e2e -c esm # cjs custom config
yarn e2e -c cjs # esm custom config

cd ../sanity-app-esm
yarn test --browsers=ChromeHeadlessCI
yarn e2e # no custom config at all
yarn e2e -c esm # cjs custom config
yarn e2e -c cjs # esm custom config

#Check scenarios with custom webpack config
cd ../full-cycle-app
#check karma builder
yarn test --browsers=ChromeHeadlessCI
#check browser and dev-server
yarn e2e
yarn e2e -c production
yarn e2e -c itwcw


