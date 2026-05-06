// Test top-level await support - this should work with the Jest builder
// Issue: https://github.com/just-jeb/angular-builders/issues/1918
const setupTime = await Promise.resolve('setup-complete');

export default {
  // Just validate the config loads with top-level await
  globals: {
    setupTime,
  },
};
