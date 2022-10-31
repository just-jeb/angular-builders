#!/bin/bash
# Start in scripts/ even if run from root directory
cd "$(dirname "$0")"
source local-registry.sh

function cleanup {
  echo 'Cleaning up.'
  cd "$root_path"
  rm -rf "$temp_app_path"
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  #stopLocalRegistry
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

#startLocalRegistry "$root_path"/scripts/verdaccio.yaml

#publishToLocalRegistry

#yarn bootstrap:examples

# On OSX there is no google-chrome
#[[ "$OSTYPE" == "darwin"* ]] && CHROME_BINARY="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome" || CHROME_BINARY="google-chrome"
# Get travis's chrome version and download the appropriate webdriver-manager for protractor
#CHROME_VERSION=`$CHROME_BINARY --version | egrep -o '[0-9.]+' | head -1`
#WEBDRIVER_MANAGER_BIN=./node_modules/protractor/bin/webdriver-manager; 
#yarn lerna exec --ignore '@angular-builders/*' "[ -f $WEBDRIVER_MANAGER_BIN ] && $WEBDRIVER_MANAGER_BIN update --versions.chrome $CHROME_VERSION || echo \`pwd\`: No webdriver-manager found"

#[ -f $WEBDRIVER_MANAGER_BIN ] && $WEBDRIVER_MANAGER_BIN update --versions.chrome $CHROME_VERSION || echo \`pwd\`: No webdriver-manager found

# Start Xvfb server for Cypress tests, should be removed once Cypress doesn't require Xvfb
[[ "$OSTYPE" == "linux-gnu"* ]] && Xvfb :99 & 
[[ "$OSTYPE" == "linux-gnu"* ]] && export DISPLAY=:99

yarn workspaces foreach run ci

pkill Xvfb

#cleanup
