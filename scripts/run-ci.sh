#!/bin/bash
# Start in scripts/ even if run from root directory
cd "$(dirname "$0")"
source local-registry.sh

function cleanup {
  echo 'Cleaning up.'
  cd "$root_path"
  rm -rf "$temp_app_path"
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  stopLocalRegistry
}

# Error messages are redirected to stderr
function handle_error {
  echo "$(basename $0): ERROR! An error was encountered executing line $1." 1>&2;
  cleanup
  echo 'Exiting with error.' 1>&2;
  exit 1
}

function handle_exit {
  cleanup
  echo 'Exiting without error.' 1>&2;
  exit
}

# Exit the script with a helpful error message when any error is encountered
trap 'set +x; handle_error $LINENO $BASH_COMMAND' ERR

# Cleanup before exit on any termination signal
trap 'set +x; handle_exit' SIGQUIT SIGTERM SIGINT SIGKILL SIGHUP

# Echo every command being executed
set -x

# Go to root
cd ..
root_path=$PWD

startLocalRegistry "$root_path"/scripts/verdaccio.yaml

publishToLocalRegistry

yarn bootstrap:examples

# Get travis's chrome version and download the appropriate webdriver-manager for protractor
CHROME_VERSION=`google-chrome --version | egrep -o '[0-9.]+' | head -1`
yarn lerna exec --ignore '@angular-builders/*' -- [ -f ./node_modules/protractor/bin/webdriver-manager ] && ./node_modules/protractor/bin/webdriver-manager update --versions.chrome $CHROME_VERSION

yarn lerna run ci

cleanup


