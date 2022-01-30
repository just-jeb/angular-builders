#!/usr/bin/env bash
set -e # exit on failure

cd ../../examples/custom-webpack/sanity-app
yarn test --browsers=ChromeHeadlessCI
yarn e2e # no custom config at all
yarn e2e -c esm # esm custom config
yarn e2e -c cjs # cjs custom config

cd ../sanity-app-esm
yarn test --browsers=ChromeHeadlessCI
yarn e2e # no custom config at all
yarn e2e -c esm # esm custom config
yarn e2e -c cjs # cjs custom config
yarn build-ts # ts custom config with ESM imports

#Check scenarios with custom webpack config
cd ../full-cycle-app
#check karma builder
yarn test --browsers=ChromeHeadlessCI
#check browser and dev-server
yarn e2e
yarn e2e -c production
yarn e2e -c itwcw


