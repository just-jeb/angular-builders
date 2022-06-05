const { TestEnvironment } = require('jest-environment-node');

class JestCustomEnvironment extends TestEnvironment {
  constructor(config) {
    super(config);
    this.jestErrorHasInstance = this.global.Error[Symbol.hasInstance];
  }

  async setup() {
    await super.setup();
    // Workaround for this bug https://github.com/facebook/jest/issues/2549
    this.jestErrorHasInstance = this.global.Error[Symbol.hasInstance];
    Object.defineProperty(this.global.Error, Symbol.hasInstance, {
      value: target => target instanceof Error || this.jestErrorHasInstance(target),
    });
  }

  async tearDown() {
    Object.defineProperty(this.global.Error, Symbol.hasInstance, {
      value: this.jestErrorHasInstance,
    });
    await super.tearDown();
  }
}

module.exports = JestCustomEnvironment;
