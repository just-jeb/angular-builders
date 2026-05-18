// CJS stub for ESM-only `ora` package.
// `@angular-devkit/schematics/tasks/package-manager/executor` requires ora at import
// time but only uses it inside the executor body. Schematic unit tests never invoke
// the install task, so this stub keeps ts-jest happy without side-effects.
'use strict';

function createSpinner() {
  const noop = () => spinner;
  const spinner = { start: noop, stop: noop, succeed: noop, fail: noop, warn: noop, info: noop };
  return spinner;
}

module.exports = createSpinner;
module.exports.default = createSpinner;
module.exports.oraPromise = async (_action, _opts) => _action;
