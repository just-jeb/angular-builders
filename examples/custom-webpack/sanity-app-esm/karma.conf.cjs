// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const fs = require('fs');
// Prefer the system Chrome (preinstalled and library-matched on CI runners); fall back to
// Puppeteer's bundled Chrome for local dev. Puppeteer's bundled binary stopped launching on
// updated CI runner images ("Cannot start ChromeHeadless"), so system Chrome is more robust.
process.env.CHROME_BIN =
  ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium'].find(
    p => fs.existsSync(p)
  ) || require('puppeteer').executablePath();

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
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/sanity-app-esm'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
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
