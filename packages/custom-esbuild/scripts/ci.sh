#!/usr/bin/env bash
set -e # exit on failure

cd ../../examples/custom-esbuild/sanity-esbuild-app
yarn test -c esm # unit-test with esm custom config
yarn test -c cjs # unit-test with cjs custom config
yarn e2e # no custom config at all
yarn e2e -c esm # esm custom config
yarn e2e -c cjs # cjs custom config

cd ../sanity-esbuild-app-esm
yarn test -c esm # unit-test with esm custom config
yarn test -c cjs # unit-test with cjs custom config
yarn test-ts -c tsEsm # unit-test with TS custom config
yarn e2e # no custom config at all
yarn e2e -c esm # esm custom config
yarn e2e -c cjs # cjs custom config
yarn build-ts -c tsEsm # ts custom config with ESM imports
