import { Path } from '@angular-devkit/core';
import { Configuration } from 'webpack';

import { CustomWebpackBuilder, defaultWebpackConfigPath } from './custom-webpack-builder';
import { MergeStrategies } from './custom-webpack-builder-config';
import { mergeConfigs } from './webpack-config-merger';

jest.mock('./webpack-config-merger');
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
    createConfigFile(defaultWebpackConfigPath, customWebpackConfig);
    CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig, {});

    expect(mergeConfigs).toHaveBeenCalledWith(
      baseWebpackConfig,
      customWebpackConfig,
      undefined,
      undefined
    );
  });

  it('Should load the file specified in configuration', () => {
    const fileName = 'extra-webpack.config.js';
    createConfigFile(fileName, customWebpackConfig);

    CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      { path: fileName },
      baseWebpackConfig,
      {}
    );

    expect(mergeConfigs).toHaveBeenCalledWith(
      baseWebpackConfig,
      customWebpackConfig,
      undefined,
      undefined
    );
  });

  it('Should pass on merge strategies', () => {
    createConfigFile(defaultWebpackConfigPath, customWebpackConfig);
    const mergeStrategies: MergeStrategies = { blah: 'prepend' };

    CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      { mergeStrategies },
      baseWebpackConfig,
      {}
    );

    expect(mergeConfigs).toHaveBeenCalledWith(
      baseWebpackConfig,
      customWebpackConfig,
      mergeStrategies,
      undefined
    );
  });

  it('Should pass on replaceDuplicatePlugins flag', () => {
    createConfigFile(defaultWebpackConfigPath, customWebpackConfig);

    CustomWebpackBuilder.buildWebpackConfig(
      __dirname as Path,
      { replaceDuplicatePlugins: true },
      baseWebpackConfig,
      {}
    );

    expect(mergeConfigs).toHaveBeenCalledWith(
      baseWebpackConfig,
      customWebpackConfig,
      undefined,
      true
    );
  });

  it('Should pass build options to the webpack config function', () => {
    const spy = jest.fn((config, options) => config);
    createConfigFile(defaultWebpackConfigPath, spy);
    CustomWebpackBuilder.buildWebpackConfig(__dirname as Path, {}, baseWebpackConfig, buildOptions);
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

  it('Should resolve webpack config asynchronously', async () => {
    // On some project that would be `module.exports = async config => { ... }`
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
});
