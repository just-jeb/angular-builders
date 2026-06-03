// Stub for the ESM-only `ora` package. Tests never exercise the
// package-manager task executor that uses ora, so a no-op spinner is enough.
'use strict';

function ora() {
  return {
    start: () => ({ stop: () => {}, succeed: () => {}, fail: () => {} }),
    stop: () => {},
    succeed: () => {},
    fail: () => {},
  };
}

module.exports = ora;
module.exports.default = ora;
