const config = require('./protractor-ci.conf').config;

config.specs.push('./src/**/*.e2e-spec-prod.ts');

exports.config = config;
