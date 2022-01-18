jest.mock('ts-node', () => ({
  register: jest.fn(),
}));
jest.mock('tsconfig-paths', () => ({
  loadConfig: jest.fn().mockReturnValue({}),
}));
import * as utils from './utils';
jest.spyOn(utils, 'tsNodeRegister');

import { getTransforms } from './transform-factories';

const logger = { warn: jest.fn(msg => console.log(msg)) };

describe('getTransforms', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should call ts-node register once with typescript index-html-transform & custom-webpack-config AND warn if called with a different config', () => {
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
      { workspaceRoot: './test', logger } as any
    );
    transforms.webpackConfiguration({});

    expect(utils.tsNodeRegister).toHaveBeenCalledWith(
      'test/webpack.test.config.ts',
      'test/tsconfig.test.json',
      logger
    );
    expect(utils.tsNodeRegister).toHaveBeenCalledWith(
      'index-transform.test.ts',
      'test/tsconfig.test.json',
      logger
    );
    expect(tsNode.register).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();

    const transforms2 = getTransforms(
      {
        customWebpackConfig: {
          path: 'webpack.test.config.ts',
        },
        indexTransform: '',
        tsConfig: 'tsconfig.test2.json',
      },
      { workspaceRoot: './test', logger } as any
    );
    transforms2.webpackConfiguration({});

    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});
