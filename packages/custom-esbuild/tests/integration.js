module.exports = [
  // Vitest builder tests
  {
    id: 'vitest-builder-esm-config',
    name: 'custom-esbuild: Vitest ESM plugins',
    purpose: 'Unit test builder works with ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn test -c esm --no-watch',
  },
  {
    id: 'vitest-builder-cjs-config',
    name: 'custom-esbuild: Vitest CJS plugins',
    purpose: 'Unit test builder works with CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn test -c cjs --no-watch',
  },
  {
    id: 'vitest-esm-package-esm',
    name: 'custom-esbuild: Vitest ESM package ESM',
    purpose: 'Unit test builder in ESM package with ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test -c esm --no-watch',
  },
  {
    id: 'vitest-esm-package-cjs',
    name: 'custom-esbuild: Vitest ESM package CJS',
    purpose: 'Unit test builder in ESM package with CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test -c cjs --no-watch',
  },
  {
    id: 'vitest-ts-config',
    name: 'custom-esbuild: Vitest TS config',
    purpose: 'Unit test builder loads TypeScript config',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn test-ts -c tsEsm --no-watch',
  },

  // Application builder + plugins tests
  {
    id: 'app-builder-plugins',
    name: 'custom-esbuild: App ESBuild plugins',
    purpose: 'Application builder applies ESBuild plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e',
  },
  {
    id: 'app-builder-esm-plugins',
    name: 'custom-esbuild: App ESM plugins',
    purpose: 'Application builder loads ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'app-builder-cjs-plugins',
    name: 'custom-esbuild: App CJS plugins',
    purpose: 'Application builder loads CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app',
    command: 'yarn e2e -c cjs',
  },
  {
    id: 'esm-package-plugins',
    name: 'custom-esbuild: ESM package app',
    purpose: 'ESM package application builder works',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e',
  },
  {
    id: 'esm-package-esm-plugins',
    name: 'custom-esbuild: ESM package ESM plugins',
    purpose: 'ESM package loads ESM plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e -c esm',
  },
  {
    id: 'esm-package-cjs-plugins',
    name: 'custom-esbuild: ESM package CJS plugins',
    purpose: 'ESM package loads CJS plugins',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn e2e -c cjs',
  },

  // TypeScript config
  {
    id: 'ts-plugins-esm-imports',
    name: 'custom-esbuild: TS plugins ESM imports',
    purpose: 'Builder loads TypeScript plugins with ESM imports',
    app: 'examples/custom-esbuild/sanity-esbuild-app-esm',
    command: 'yarn build-ts -c tsEsm',
  },
];
