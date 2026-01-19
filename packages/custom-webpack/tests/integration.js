module.exports = [
  // Karma builder tests
  {
    id: 'karma-builder-sanity-app',
    name: 'custom-webpack: Karma unit tests',
    purpose: 'Karma builder executes unit tests with custom webpack config',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn test --browsers=ChromeHeadlessCI',
  },
  {
    id: 'karma-builder-sanity-app-esm',
    name: 'custom-webpack: Karma ESM package',
    purpose: 'Karma builder works in ESM package',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn test --browsers=ChromeHeadlessCI',
  },
  {
    id: 'karma-builder-full-cycle',
    name: 'custom-webpack: Karma full customization',
    purpose: 'Karma builder works with full webpack customization',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn test --browsers=ChromeHeadlessCI',
  },

  // Browser/dev-server builder tests
  {
    id: 'browser-builder-basic',
    name: 'custom-webpack: Browser + dev-server',
    purpose: 'Browser + dev-server builders work with no custom config',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn e2e',
  },
  {
    id: 'browser-builder-esm-config',
    name: 'custom-webpack: ESM config (.mjs)',
    purpose: 'Builder correctly loads ESM webpack config (.mjs)',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'browser-builder-cjs-config',
    name: 'custom-webpack: CJS config (.js)',
    purpose: 'Builder correctly loads CJS webpack config (.js)',
    app: 'examples/custom-webpack/sanity-app',
    command: 'yarn e2e -c cjs',
  },
  {
    id: 'esm-package-default',
    name: 'custom-webpack: ESM package',
    purpose: 'Builder works in ESM package (type: module)',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn e2e',
  },
  {
    id: 'esm-package-esm-config',
    name: 'custom-webpack: ESM package ESM config',
    purpose: 'ESM package loads ESM config correctly',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'esm-package-cjs-config',
    name: 'custom-webpack: ESM package CJS config',
    purpose: 'ESM package loads CJS config correctly',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn e2e -c cjs',
  },

  // Index transform tests
  {
    id: 'index-transform-js',
    name: 'custom-webpack: JS indexTransform',
    purpose: 'JavaScript indexTransform modifies index.html',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn e2e',
  },
  {
    id: 'index-transform-production',
    name: 'custom-webpack: indexTransform config name',
    purpose: 'indexTransform receives correct configuration name',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn e2e -c production',
  },
  {
    id: 'index-transform-ts',
    name: 'custom-webpack: TS indexTransform',
    purpose: 'TypeScript indexTransform works',
    app: 'examples/custom-webpack/full-cycle-app',
    command: 'yarn e2e -c itwcw',
  },

  // TypeScript config loading
  {
    id: 'ts-config-esm-imports',
    name: 'custom-webpack: TS config ESM imports',
    purpose: 'Builder loads TypeScript config with ESM imports',
    app: 'examples/custom-webpack/sanity-app-esm',
    command: 'yarn build-ts -c tsEsm',
  },
];
