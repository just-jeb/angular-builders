jest.mock('ts-node', () => ({
  register: jest.fn(),
}));
jest.mock('tsconfig-paths', () => ({
  loadConfig: jest.fn().mockReturnValue({}),
}));
import * as utils from './utils';
jest.spyOn(utils, 'tsNodeRegister');

import { getTransforms } from './transform-factories';

describe('getTransforms', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  it('should call ts-node register once with typescript index-html-transform & custom-webpack-config', () => {
    jest.mock('test/index-transform.test.ts', () => jest.fn(), { virtual: true });
    jest.mock('test/webpack.test.config.ts', () => jest.fn(), { virtual: true });
    const tsNode = require('ts-node') as jest.Mocked<typeof import('ts-node')>;

    const transforms = getTransforms(
      {
        customWebpackConfig: {
          path: 'webpack.test.config.ts',
        },
        indexTransform: 'index-transform.test.ts',
        tsConfig: 'tsconfig.test.json',
      },
      { workspaceRoot: './test' } as any
    );
    transforms.webpackConfiguration({});

    expect(utils.tsNodeRegister).toHaveBeenCalledWith(
      'test/webpack.test.config.ts',
      'test/tsconfig.test.json'
    );
    expect(utils.tsNodeRegister).toHaveBeenCalledWith(
      'index-transform.test.ts',
      'test/tsconfig.test.json'
    );
    expect(tsNode.register).toHaveBeenCalledTimes(1);
  });
});
