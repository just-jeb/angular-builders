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
      // moduleResolution: 'node' is paired with module: 'CommonJS' above.
      //
      // Without this override, user tsconfigs declaring moduleResolution: 'bundler'
      // or 'Node16' raise TS5095/TS5110 against the forced module: 'CommonJS'.
      //
      // Safe under transpileOnly: true — ts-node only transpiles, never resolves
      // imports against this setting. The user's tsconfig still governs editor and
      // build-time type checking. See PR #1659 and the regression it addresses
      // (#1197, #1213). PR #2187 previously removed this override because it broke
      // path resolution for user code; transpileOnly makes that case moot.
      moduleResolution: 'node',
      types: [
        'node', // user scripts (e.g. webpack.config) commonly require node builtins
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
