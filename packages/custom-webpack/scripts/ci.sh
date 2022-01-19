#!/usr/bin/env bash

#Check that it works the same way angular-devkit builders do when there is no custom webpack config provided
cd ../../examples/custom-webpack/sanity-app
#ng build is verified during lerna run
yarn test --browsers=ChromeHeadlessCI
yarn e2e

#Check scenarios with custom webpack config
cd ../full-cycle-app
#ng build is verified during lerna run
#check karma builder
yarn test --browsers=ChromeHeadlessCI
#check browser and dev-server
yarn e2e
yarn e2e -c production
yarn e2e -c itwcw


