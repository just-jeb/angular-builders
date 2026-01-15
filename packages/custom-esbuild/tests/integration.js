module.exports = [
  // Vitest builder tests
  {
    id: 'vitest-builder-esm-config',
    purpose: 'Unit test builder works with ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn test -c esm --no-watch',
  },
  {
    id: 'vitest-builder-cjs-config',
    purpose: 'Unit test builder works with CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn test -c cjs --no-watch',
  },
  {
    id: 'vitest-esm-package-esm',
    purpose: 'Unit test builder in ESM package with ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test -c esm --no-watch',
  },
  {
    id: 'vitest-esm-package-cjs',
    purpose: 'Unit test builder in ESM package with CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test -c cjs --no-watch',
  },
  {
    id: 'vitest-ts-config',
    purpose: 'Unit test builder loads TypeScript config',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test-ts -c tsEsm --no-watch',
  },

  // Application builder + plugins tests
  {
    id: 'app-builder-plugins',
    purpose: 'Application builder applies ESBuild plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e',
  },
  {
    id: 'app-builder-esm-plugins',
    purpose: 'Application builder loads ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'app-builder-cjs-plugins',
    purpose: 'Application builder loads CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e -c cjs',
  },
  {
    id: 'esm-package-plugins',
    purpose: 'ESM package application builder works',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e',
  },
  {
    id: 'esm-package-esm-plugins',
    purpose: 'ESM package loads ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'esm-package-cjs-plugins',
    purpose: 'ESM package loads CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e -c cjs',
  },

  // TypeScript config
  {
    id: 'ts-plugins-esm-imports',
    purpose: 'Builder loads TypeScript plugins with ESM imports',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn build-ts -c tsEsm',
  },
];
