#!/usr/bin/env bash
set -e # exit on failure

cd ../../examples/custom-esbuild/sanity-esbuild-app
yarn test --browsers=ChromeHeadlessCI
yarn e2e # no custom config at all
yarn e2e -c esm # esm custom config
yarn e2e -c cjs # cjs custom config
