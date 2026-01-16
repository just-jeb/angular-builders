module.exports = [
  {
    id: 'bazel-build',
    purpose: 'Bazel builder invokes bazel and produces correct output',
    app: 'examples/bazel',
    command: 'node ../../packages/bazel/tests/validate.js',
  },
];
