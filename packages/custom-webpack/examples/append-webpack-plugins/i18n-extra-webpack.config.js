// Our very simple sample i18n plugin.
const I18nXlfAnnotateAppVersionPlugin = require('./build/i18n-xlf-annotate-app-version.plugin.js');

/**
 * This is where you define your additional webpack configuration items to be appended to
 * the end of the webpack config.
 */
module.exports = {
  plugins: [
    new I18nXlfAnnotateAppVersionPlugin()
  ]
};
