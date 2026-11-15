// Fails when .nvmrc is not the minimum Node that the installed @angular/build supports.
// The repo develops and tests on the oldest Node the current Angular major allows, so a
// published builder never depends on a Node feature newer than Angular itself needs.
// An Angular update that raises the minimum makes this check fail until .nvmrc is bumped.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const nvmrc = fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim().replace(/^v/, '');
const angular = require(path.join(root, 'node_modules/@angular/build/package.json'));
const range = angular.engines.node;

const parse = v => v.split('.').map(Number);
const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

// Every alternative in the range ("^22.22.3 || ^24.15.0 || >=26.0.0") has a lower bound.
const bounds = range
  .split('||')
  .map(part => parse(part.trim().replace(/^[\^>=~\s]+/, '')))
  .sort(compare);
const minimum = bounds[0].join('.');

if (nvmrc.split('.').length !== 3) {
  console.error(`.nvmrc must hold a full version (x.y.z), found "${nvmrc}".`);
  process.exit(1);
}
const current = parse(nvmrc);
if (current[0] !== bounds[0][0] || compare(current, bounds[0]) < 0) {
  console.error(
    `.nvmrc is ${nvmrc}, which is not the minimum Node for @angular/build@${angular.version} (requires ${range}).\n` +
      `Set .nvmrc to ${minimum} (the minimum) or a later ${bounds[0][0]}.x release, and update the matching "node" pin if any.`
  );
  process.exit(1);
}
console.log(`.nvmrc ${nvmrc} is on Angular's minimum Node line (${range}).`);
