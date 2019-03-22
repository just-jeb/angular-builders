import { buildServerConfig, DevServerBuilderSchema } from '@angular-devkit/build-angular/src/dev-server/index2';
import { LoggerApi } from '@angular-devkit/core/src/logger';
import { Configuration as WebpackDevServerConfig } from 'webpack-dev-server';
import { serverConfigTransformFactory } from './index';

jest.mock('@angular-devkit/architect/src/index2');
jest.mock('@angular-devkit/build-angular/src/dev-server/index2');

const mockOriginalDevServerConfig: WebpackDevServerConfig = {
    host: 'myhost',
    port: 9999
};

const mockMergedConfig = {
    blah: 'blah'
};

const options: DevServerBuilderSchema = {
    browserTarget: 'my:browser:target'
};

const browserOptions: any = {
    blahblah: 1
};

const context: any = {
    logger: {} as unknown as LoggerApi
};

const buildServerConfigMock: jest.Mock = buildServerConfig as any;
buildServerConfigMock.mockImplementation(() => mockOriginalDevServerConfig);

describe('Dev server', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    describe('config transform', () => {
        let serverConfigTransform = serverConfigTransformFactory(options, browserOptions, context)

        const workspace: any = { root: 'myroot' };

        it('should include original config', (done) => {
            const config: any = { a: 1 };
            serverConfigTransform(workspace, config).subscribe(serverConfig => {
                expect(serverConfig).toEqual(expect.objectContaining(mockOriginalDevServerConfig));
                done();
            });
        })

        it('should include the modification when exist', (done) => {
            const config: any = { a: 1, devServer: { ohmy: 'god' } };
            serverConfigTransform(workspace, config).subscribe(serverConfig => {
                expect(serverConfig).toEqual(expect.objectContaining(config.devServer));
                done();
            });
        })

        it('should call buildServerConfig with the right parameters', (done) => {
            const config: any = { a: 1 };
            serverConfigTransform(workspace, config).subscribe(serverConfig => {
                expect(buildServerConfigMock).toHaveBeenCalledWith(
                    workspace.root, options, browserOptions, context.logger
                )
                done();
            });
        })
    })
    //TODO: finish tests
    describe('builder', () => {
        it('', () => {

        })
    })
})