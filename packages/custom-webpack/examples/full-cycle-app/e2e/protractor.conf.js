// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type {import('protractor').Config}
 */
exports.config = {
  allScriptsTimeout: 11000,
  specs: ['./src/**/*.e2e-spec.ts'],
  capabilities: {
    browserName: 'chrome',
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {},
  },
  onPrepare() {
    const tsConfig = require('path').join(__dirname, './tsconfig.json');
    require('ts-node').register({
      project: tsConfig,
    });

    // Register paths in tsConfig
    const tsconfigPaths = require('tsconfig-paths');
    const { absoluteBaseUrl: baseUrl, paths } = tsconfigPaths.loadConfig(tsConfig);
    if (baseUrl && paths) {
      tsconfigPaths.register({ baseUrl, paths });
    }
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  },
};
