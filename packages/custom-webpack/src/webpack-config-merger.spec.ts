import { mergeConfigs } from './webpack-config-merger';
import * as webpack from 'webpack';
import merge, { CustomizeRule } from 'webpack-merge';

describe('Webpack config merger test', () => {
  it('Should replace plugins', () => {
    const plugin1 = new webpack.HotModuleReplacementPlugin({
      multiStep: true,
      fullBuildTimeout: 3000,
      requestTimeout: 1000,
    });
    const plugin2 = new webpack.HotModuleReplacementPlugin({
      multiStep: false,
      requestTimeout: 500,
    });

    const output = mergeConfigs(
      {
        plugins: [plugin1],
      },
      {
        plugins: [plugin2],
      },
      {},
      true
    );

    const expected = {
      plugins: [plugin2],
    };

    expect(output).toEqual(expected);
  });

  it('Should append plugins', () => {
    const plugin1 = new webpack.HotModuleReplacementPlugin();
    const plugin2 = new webpack.ContextReplacementPlugin('1');

    const output = mergeConfigs(
      {
        plugins: [plugin1],
      },
      {
        plugins: [plugin2],
      }
    );

    const expected = {
      plugins: [plugin1, plugin2],
    };

    expect(output).toEqual(expected);
  });

  it('Should not replace anything if there are no duplicates', () => {
    const plugin1 = new webpack.HotModuleReplacementPlugin();
    const plugin2 = new webpack.ContextReplacementPlugin('1');

    const output = mergeConfigs(
      {
        plugins: [plugin1],
      },
      {
        plugins: [plugin2],
      },
      {},
      true
    );

    const expected = {
      plugins: [plugin1, plugin2],
    };

    expect(output).toEqual(expected);
  });

  it('Should merge plugins if there are duplicates', () => {
    const plugin1 = new webpack.HotModuleReplacementPlugin({
      multiStep: true,
      fullBuildTimeout: 3000,
      requestTimeout: 1000,
    });

    const plugin2 = new webpack.ContextReplacementPlugin('1');

    const plugin3 = new webpack.HotModuleReplacementPlugin({
      fullBuildTimeout: 300,
      requestTimeout: 500,
    });

    const output = mergeConfigs(
      {
        plugins: [plugin1, plugin2],
      },
      {
        plugins: [plugin3],
      },
      {}
    );

    const expected = {
      plugins: [
        plugin2,
        new webpack.HotModuleReplacementPlugin({
          multiStep: true,
          fullBuildTimeout: 300,
          requestTimeout: 500,
        }),
      ],
    };

    expect(output.plugins).toBeDefined();
    if (output.plugins) {
      expect(output.plugins[0]).toBeInstanceOf(webpack.ContextReplacementPlugin);
      expect(output.plugins[1]).toBeInstanceOf(webpack.HotModuleReplacementPlugin);
    }
    expect(output).toEqual(expected);
  });

  it(`Should handle non-duplicate plugins properly`, () => {
    const plugin1 = new webpack.DefinePlugin({
      a: 1,
    });
    const output = mergeConfigs(
      {
        plugins: [],
      },
      {
        plugins: [plugin1],
      },
      {}
    );

    const expected = {
      plugins: [plugin1],
    };

    expect(output.plugins).toBeDefined();
    if (output.plugins) {
      expect(output.plugins[0]).toBeInstanceOf(webpack.DefinePlugin);
      expect(output).toEqual(expected);
    }
  });

  it('Should replace plugins while working properly with merging rules', () => {
    const plugin1 = new webpack.HotModuleReplacementPlugin({
      multiStep: true,
      fullBuildTimeout: 3000,
      requestTimeout: 1000,
    });
    const plugin2 = new webpack.HotModuleReplacementPlugin({
      multiStep: false,
      requestTimeout: 500,
    });

    const output = mergeConfigs(
      {
        externals: ['a', 'b'],
        plugins: [plugin1],
      },
      {
        externals: ['c', 'd'],
        plugins: [plugin2],
      },
      { externals: CustomizeRule.Prepend },
      true
    );

    const expected = {
      externals: ['c', 'd', 'a', 'b'],
      plugins: [plugin2],
    };

    expect(output).toEqual(expected);
  });

  it('Should merge loader options', () => {
    const output = mergeConfigs(
      {
        module: {
          rules: [
            {
              test: /\.css$/,
              use: [
                {
                  loader: 'style-loader',
                  options: {
                    someOption: 'blah',
                  },
                },
                { loader: 'sass-loader' },
              ],
            },
          ],
        },
      },
      {
        module: {
          rules: [
            {
              test: /\.css$/,
              use: [
                {
                  loader: 'style-loader',
                  options: {
                    modules: true,
                  },
                },
              ],
            },
          ],
        },
      }
    );

    const expected = {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              {
                loader: 'style-loader',
                options: {
                  modules: true,
                  someOption: 'blah',
                },
              },
              { loader: 'sass-loader' },
            ],
          },
        ],
      },
    };

    expect(output).toEqual(expected);
  });

  it('should append loaders even if there is not intersection between configs', () => {
    const conf1 = {
      module: {
        rules: [
          {
            test: '/\\.scss$|\\.sass$/',
            use: [
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  sassOptions: {
                    precision: 8,
                    outputStyle: 'expanded',
                  },
                },
              },
            ],
          },
        ],
      },
    };
    const conf2 = {
      module: {
        rules: [
          {
            test: '/\\.scss$|\\.sass$/',
            use: [
              {
                loader: 'sass-resources-loader',
                options: {
                  resources: ['src/styles/includes.scss'],
                },
              },
            ],
          },
        ],
      },
    };

    const expected = {
      module: {
        rules: [
          {
            test: '/\\.scss$|\\.sass$/',
            use: [
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  sassOptions: {
                    precision: 8,
                    outputStyle: 'expanded',
                  },
                },
              },
              {
                loader: 'sass-resources-loader',
                options: {
                  resources: ['src/styles/includes.scss'],
                },
              },
            ],
          },
        ],
      },
    };

    expect(mergeConfigs(conf1, conf2)).toEqual(expected);
  });

  it('should merge loader name with loader object', () => {
    const conf1 = {
      module: {
        rules: [
          {
            test: 'some-test',
            use: ['hello-loader'],
          },
        ],
      },
    };

    const conf2 = {
      module: {
        rules: [
          {
            test: 'another-test',
            use: [
              {
                loader: 'another-loader',
                options: {
                  someoption: 'hey',
                },
              },
            ],
          },
        ],
      },
    };

    const expected = {
      module: {
        rules: [
          {
            test: 'some-test',
            use: ['hello-loader'],
          },
          {
            test: 'another-test',
            use: [
              {
                loader: 'another-loader',
                options: {
                  someoption: 'hey',
                },
              },
            ],
          },
        ],
      },
    };

    expect(mergeConfigs(conf1, conf2)).toEqual(expected);
  });
});
