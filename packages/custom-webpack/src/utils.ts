const _tsNodeRegister = (() => {
  let lastTsConfig: string | null | undefined;
  return (tsConfig?: string) => {
    // Check if the function was previously called with the same tsconfig
    if (typeof lastTsConfig !== 'undefined' && (tsConfig ?? null) !== lastTsConfig) {
      throw new Error('Called with multiple tsconfigs.');
    }
    if (lastTsConfig) {
      return;
    }
    lastTsConfig = tsConfig ?? null;

    // Register ts-node
    require('ts-node').register({
      project: tsConfig,
      compilerOptions: {
        module: 'CommonJS',
        types: [
          'node', // NOTE: `node` is added because users scripts can also use pure node's packages as webpack or others
        ],
      },
    });

    // Register paths in tsConfig
    const tsconfigPaths = require('tsconfig-paths');
    const { absoluteBaseUrl: baseUrl, paths } = tsconfigPaths.loadConfig(tsConfig);
    if (baseUrl && paths) {
      tsconfigPaths.register({ baseUrl, paths });
    }
  };
})();

/**
 * check for TS node registration
 * @param file: file name or file directory are allowed
 * @todo tsNodeRegistration: require ts-node if file extension is TypeScript
 */
export function tsNodeRegister(file: string = '', tsConfig?: string) {
  if (file && file.endsWith('.ts')) {
    // Register TS compiler lazily
    _tsNodeRegister(tsConfig);
  }
}
