const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { exit } = require('process');

runTests();

function runTests() {
  process.chdir('../../examples/bazel');
  runBuild();
  compareResults();
}

function runBuild() {
  execSync('yarn build');
}

function compareResults() {
  const expectedOut = 'hello world\n';
  const bazelOut = readFileSync('./bazel-bin/out', { encoding: 'utf-8' });
  if (bazelOut !== expectedOut) {
    console.log(`ERROR: Expected bazel output is ${expectedOut}, actual is ${bazelOut}`);
    exit(1);
  }
}
