let isTsEsmLoaderRegistered = false;

export function registerTsProject(tsConfig: string) {
  const cleanupFunctions = [registerTsConfigPaths(tsConfig), registerTsNodeService(tsConfig)];

  // Add ESM support for `.ts` files.
  // NOTE: There is no cleanup function for this, as it's not possible to unregister the loader.
  //       Based on limited testing, it doesn't seem to matter if we register it multiple times, but just in
  //       case let's keep a flag to prevent it.
  if (!isTsEsmLoaderRegistered) {
    const module = require('node:module');
    if (module.register && packageIsInstalled('ts-node/esm')) {
      const url = require('node:url');
      module.register(url.pathToFileURL(require.resolve('ts-node/esm')));
    }
    isTsEsmLoaderRegistered = true;
  }

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

function packageIsInstalled(m: string): boolean {
  try {
    require.resolve(m);
    return true;
  } catch {
    return false;
  }
}
