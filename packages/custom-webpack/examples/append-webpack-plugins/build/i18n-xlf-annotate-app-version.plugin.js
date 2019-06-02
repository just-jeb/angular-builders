const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom');

const { version } = require('../package.json');

/*
 * I18nXlfAnnotateAppVersionPlugin is a dummy albeit slightly contrived which
 * takes the version from the package.json and adds it as an attribute (app-version) 
 * to all messsages*.xlf within the src/i18n directory.
 */
class I18nXlfAnnotateAppVersionPlugin {
  /*
   *
   * @param {Object} compiler - The webpack compile object.
   * */
  apply(compiler) {
    compiler.hooks.done.tapPromise('I18nXlfAnnotateAppVersionPlugin', (stats) => {
      console.log('I18nXlfAnnotateAppVersionPlugin start');

      const i18nDir = fs.readdirSync('src/i18n');

      i18nDir.forEach(f => {
        console.log('Processing file', f);
        const filePath = `src/i18n/${f}`;

        const xlfFile = fs.readFileSync(filePath);
        const doc = new DOMParser().parseFromString(xlfFile.toString(), 'text/xml');

        const fileNode = doc.getElementsByTagName('file')[0];

        if(fileNode.attributes['app-version'] !== version) {
          console.log('New Appliction Version ', version);
          fileNode.setAttribute('app-version', version);
        }

        const serialiser = new XMLSerializer();

        fs.writeFileSync(filePath, serialiser.serializeToString(doc));
      });

      console.log('I18nXlfAnnotateAppVersionPlugin finish');
      return Promise.resolve();
    });
  }
}

module.exports = I18nXlfAnnotateAppVersionPlugin;
