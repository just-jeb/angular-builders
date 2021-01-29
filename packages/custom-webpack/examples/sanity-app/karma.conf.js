// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require('path');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: path.join(__dirname, 'coverage', 'append-webpack-plugins'),
      subdir: '.',
      reporters: [
        { type: 'text-summary' },
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly' },
        { type: 'json' },
      ],
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    flags: ['--disable-translate', '--disable-extensions'],
    browsers: ['Chrome'],
    browserConsoleLogOptions: {
      terminal: false,
    },
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-translate', '--disable-extensions'],
      },
    },
    singleRun: true,
    restartOnFileChange: true,
  });
};
