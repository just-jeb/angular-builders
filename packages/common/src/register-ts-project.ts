export function registerTsProject(tsConfig: string) {
  const cleanupFunctions = [registerTsConfigPaths(tsConfig), registerTsNodeService(tsConfig)];

  return () => {
    cleanupFunctions.forEach(fn => fn());
  };
}

function registerTsNodeService(tsConfig: string): VoidFunction {
  const { register } = require('ts-node') as typeof import('ts-node');

  const service = register({
    transpileOnly: true,
    project: tsConfig,
    compilerOptions: {
      module: 'CommonJS',
      // Override moduleResolution to 'node' so it is compatible with module: 'CommonJS'.
      // User tsconfigs may specify moduleResolution: 'bundler' or 'Node16' which are
      // incompatible with module: 'CommonJS' in transpileOnly mode (TS5095, TS5110).
      // This override only affects ts-node transpilation, not type checking.
      moduleResolution: 'node',
      types: [
        'node', // NOTE: `node` is added because users scripts can also use pure node's packages as webpack or others
      ],
    },
  });

  return () => {
    service.enabled(false);
  };
}

function registerTsConfigPaths(tsConfig: string): VoidFunction {
  const tsConfigPaths = require('tsconfig-paths') as typeof import('tsconfig-paths');
  const result = tsConfigPaths.loadConfig(tsConfig);
  if (result.resultType === 'success') {
    const { absoluteBaseUrl: baseUrl, paths } = result;
    if (baseUrl && paths) {
      // Returns a function to undo paths registration.
      return tsConfigPaths.register({ baseUrl, paths });
    }
  }

  // We cannot return anything here if paths failed to be registered.
  // Additionally, I don't think we should perform any logging in this
  // context, considering that this is internal information not exposed
  // to the end user
  return () => {};
}
