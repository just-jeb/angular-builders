// Compiles ESM-only `.mjs` dependencies to CommonJS so Jest can `require()` them.
// Jest only loads ESM natively under --experimental-vm-modules, which these specs don't use.
// The forcing case: @angular-devkit/schematics >= 22.2 requires magic-string 1.x, which ships
// only `dist/index.mjs`, so every schematics spec failed with ERR_REQUIRE_ESM.
const { createJiti } = require('jiti');

const jiti = createJiti(__filename);

module.exports = {
  process(source, filename) {
    return { code: jiti.transform({ source, filename, interopDefault: true }) };
  },
};
