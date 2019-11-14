import { Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';

import { CustomWebpackBuilder, defaultWebpackConfigPath } from './custom-webpack-builder';
import { MergeStrategies } from './custom-webpack-builder-config';
import * as webpackConfigMerger from './webpack-config-merger';

const baseWebpackConfig = {
  entry: './main.ts'
};

const buildOptions = {
  env: 'prod'
};

const customWebpackConfig = {
  module: {
    rules: [
      {
        test: '.node',
        use: 'node-loader'
      }
    ]
  }
};

const customWebpackFunction = (config: any, options: any) => ({
  ...config,
  module: {
    rules: [
      {
        test: '.node',
        user: 'node-loader'
      }
    ]
  }
});

const customWebpackFunctionObj = {
  entry: './main.ts',
  module: {
    rules: [
      {
        test: '.node',
        user: 'node-loader'
      }
    ]
  }
};

function createConfigFile<T>(fileName: string, content: T) {
  jest.mock(`${__dirname}/${fileName}`, () => content, { virtual: true });
}

describe('CustomWebpackBuilder test', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('Should return original config if no custom configuration object has been provided', () => {
    const mergedConfig = CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      null,
      baseWebpackConfig,
      {}
    );

    expect(mergedConfig).toEqual(baseWebpackConfig);
  });

  it('Should load webpack.config.js if no path specified', () => {
    const spy = jest.spyOn(webpackConfigMerger, 'mergeConfigs');
    createConfigFile(defaultWebpackConfigPath, customWebpackConfig);
    CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig, {});

    try {
      expect(spy).toHaveBeenCalledWith(
        baseWebpackConfig,
        customWebpackConfig,
        undefined,
        undefined
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('Should load the file specified in configuration', () => {
    const spy = jest.spyOn(webpackConfigMerger, 'mergeConfigs');
    const fileName = 'extra-webpack.config.js';
    createConfigFile(fileName, customWebpackConfig);

    CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      { path: fileName },
      baseWebpackConfig,
      {}
    );

    try {
      expect(spy).toHaveBeenCalledWith(
        baseWebpackConfig,
        customWebpackConfig,
        undefined,
        undefined
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('Should pass on merge strategies', () => {
    const spy = jest.spyOn(webpackConfigMerger, 'mergeConfigs');
    createConfigFile(defaultWebpackConfigPath, customWebpackConfig);
    const mergeStrategies: MergeStrategies = { blah: 'prepend' };

    CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      { mergeStrategies },
      baseWebpackConfig,
      {}
    );

    try {
      expect(spy).toHaveBeenCalledWith(
        baseWebpackConfig,
        customWebpackConfig,
        mergeStrategies,
        undefined
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('Should pass on replaceDuplicatePlugins flag', () => {
    const spy = jest.spyOn(webpackConfigMerger, 'mergeConfigs');
    createConfigFile(defaultWebpackConfigPath, customWebpackConfig);

    CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      { replaceDuplicatePlugins: true },
      baseWebpackConfig,
      {}
    );

    try {
      expect(spy).toHaveBeenCalledWith(
        baseWebpackConfig,
        customWebpackConfig,
        undefined,
        true
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('Should pass build options to the webpack config function', () => {
    const spy = jest.fn((config, options) => config);
    createConfigFile(defaultWebpackConfigPath, spy);
    CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      {},
      baseWebpackConfig,
      buildOptions
    );
    expect(spy).toHaveBeenCalledWith(baseWebpackConfig, buildOptions);
  });

  it('Should apply custom function on configuration', () => {
    createConfigFile(defaultWebpackConfigPath, customWebpackFunction);

    const mergedConfig = CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      {},
      baseWebpackConfig,
      {}
    );

    expect(mergedConfig).toEqual(customWebpackFunctionObj);
  });
});

describe('CustomWebpackBuilder asynchronous behavior', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should resolve webpack config asynchronously', async () => {
    // `module.exports = async config => { ... }`
    async function customAsyncWebpackFunction(config: Configuration): Promise<Configuration> {
      return {
        ...config,
        output: {
          libraryTarget: 'umd'
        }
      };
    }

    createConfigFile(defaultWebpackConfigPath, customAsyncWebpackFunction);

    const result = CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      {},
      baseWebpackConfig,
      {}
    );

    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({
      entry: './main.ts',
      output: {
        libraryTarget: 'umd'
      }
    });
  });

  it('should resolve Promise exported by config', async () => {
    // `module.exports = new Promise(...)`
    const awaitableConfig = new Promise(resolve => {
      resolve('umd');
    }).then(libraryTarget => ({
      output: {
        libraryTarget
      }
    }));

    createConfigFile(defaultWebpackConfigPath, awaitableConfig);

    const result = CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      {},
      baseWebpackConfig,
      {}
    );

    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual({
      entry: './main.ts',
      output: {
        libraryTarget: 'umd'
      }
    });
  });
});
