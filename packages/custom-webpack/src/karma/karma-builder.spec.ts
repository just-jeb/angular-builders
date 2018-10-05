const commonConfig = {common: 1};
const stylesConfig = {styles: 2};
const nonAotTestConfig = {nonAotTest: 3};
const testConfig = {test: 4};

//Mock angular configs to avoid unnecessary computations and sandbox the test
jest.mock('@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs', () => ({
  getCommonConfig: () => commonConfig,
  getStylesConfig: () => stylesConfig,
  getNonAotTestConfig: () => nonAotTestConfig,
  getTestConfig: () => testConfig,
}));
const buildWebpackConfigMock = jest.fn();
jest.mock('../custom-webpack-builder', () => ({
  CustomWebpackBuilder: {
    buildWebpackConfig: buildWebpackConfigMock,
  }
}));
import {CustomWebpackKarmaBuilder} from './';

describe('Custom webpack karma builder test', () => {
  let builder: CustomWebpackKarmaBuilder;

  beforeEach(() => {
    // @ts-ignore
    builder = new CustomWebpackKarmaBuilder({});
  });

  it('Should merge custom webpack config with the default one', () => {
    const angularConfigs = {common: 1, styles: 2, nonAotTest: 3, test: 4};
    const customConfig = {prop: 'What a cool config'};
    const mergedConfig = {...angularConfigs, ...customConfig};
    const options = {customWebpackConfig: 'custom.webpack.js', tsConfig: 'blah'};
    buildWebpackConfigMock.mockReturnValue(mergedConfig);
    const root = `${__dirname}/../../../../`;
    const config = builder['_buildWebpackConfig'](root, root, "./", {}, options);
    expect(buildWebpackConfigMock).toHaveBeenCalledWith(root, options.customWebpackConfig, angularConfigs);
    expect(config).toEqual(mergedConfig);
  })
});