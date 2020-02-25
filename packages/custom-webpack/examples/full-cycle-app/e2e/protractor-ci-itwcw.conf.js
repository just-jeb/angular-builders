const config = require('./protractor-ci.conf').config;

config.specs = ['./src/**/*.e2e-spec-itwcw.ts'];

exports.config = config;
