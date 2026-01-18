module.exports = [
  {
    id: 'bazel-build',
    name: 'bazel: invokes bazel',
    purpose: 'Bazel builder invokes bazel and produces correct output',
    app: 'examples/bazel',
    command: 'node ../../packages/bazel/tests/validate.js',
  },
];
