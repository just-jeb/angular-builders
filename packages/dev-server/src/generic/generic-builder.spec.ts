const getTargetBuilderWebpackConfigMock = jest.fn();
jest.mock('../webpack-config-retriever', () => ({
  WebpackConfigRetriever: {
    getTargetBuilderWebpackConfig: getTargetBuilderWebpackConfigMock,
  }
}));
import {GenericDevServerBuilder} from './';

describe('Dev server generic builder test', () => {
  let builder: GenericDevServerBuilder;

  beforeEach(() => {
    // @ts-ignore
   builder = new GenericDevServerBuilder({});
  });

  it('Should override devServer config if provided', () => {
    const devServer = {prop: 'What a cool config'};
    getTargetBuilderWebpackConfigMock.mockReturnValue({someConfig: {blah: 1}, devServer});
    //Call buildWebpackConfig to imitate "run" method behavior
    // @ts-ignore
    builder.buildWebpackConfig("root", "projectRoot", {}, {index: 'blah.html', optimization: {}});
    //Call overridden _buildServerConfig method
    const config = builder['_buildServerConfig']("root", "projectRoot", {}, {index: 'blah.html', optimization: {}});
    //Validate that the final devServer config contains the config from webpack configuration
    expect(config).toMatchObject(devServer);
  })
});