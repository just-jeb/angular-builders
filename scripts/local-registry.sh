#!/bin/bash

custom_registry_url=http://localhost:4873/
original_npm_registry_url=`npm get registry`
original_yarn_registry_url=`yarn config get registry`
default_verdaccio_package=verdaccio@latest

function startLocalRegistry {
  # Start local registry
  tmp_registry_log=`mktemp`
  echo "Registry output file: $tmp_registry_log"
  (cd && nohup npx ${VERDACCIO_PACKAGE:-$default_verdaccio_package} -c $1 &>$tmp_registry_log &)
  # Wait for Verdaccio to boot
  grep -q 'http address' <(tail -f $tmp_registry_log)

  # Set registry to local registry
  npm config -g set registry "$custom_registry_url"
  npm config get registry
  yarn config set registry "$custom_registry_url"
  yarn config get registry

  # Login so we can publish packages
  #(cd && npx npm-auth-to-token@1.0.0 -u user -p password -e user@example.com -r "$custom_registry_url")
}

function stopLocalRegistry {
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  npm config -g set registry "$original_npm_registry_url"
  yarn config set registry "$original_yarn_registry_url"
}

function publishToLocalRegistry {
  yarn lerna publish prerelease --yes --force-publish=* --no-git-tag-version --no-git-reset --canary --no-commit-hooks --no-push --exact --dist-tag=latest --registry="$custom_registry_url"
}
