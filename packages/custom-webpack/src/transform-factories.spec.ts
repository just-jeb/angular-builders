import { Target } from '@angular-devkit/architect';
import { loadModule } from '@angular-builders/common';
import { getTransforms, indexHtmlTransformFactory } from './transform-factories';

// Module loading is the responsibility of `@angular-builders/common` (covered by
// its own load-module.spec). The previous ts-node "register once / warn on a
// different tsconfig" behavior no longer exists: jiti uses an isolated instance
// per tsconfig, so there is no process-global registration to assert. These tests
// verify transform-factories' own wiring instead.
jest.mock('@angular-builders/common', () => ({ loadModule: jest.fn() }));

const mockedLoadModule = loadModule as jest.MockedFunction<typeof loadModule>;
const logger = { warn: jest.fn(), info: jest.fn() } as any;

describe('transform factories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('produces a null indexHtml transform when no indexTransform is configured', () => {
    const { indexHtml } = getTransforms(
      { customWebpackConfig: { path: 'webpack.config.ts' }, tsConfig: 'tsconfig.json' } as any,
      { workspaceRoot: '/root', target: {} as Target, logger } as any
    );

    expect(indexHtml).toBeNull();
  });

  it('loads the index transform via loadModule and passes the target', async () => {
    const transformer = jest.fn().mockResolvedValue('<html>transformed</html>');
    mockedLoadModule.mockResolvedValue(transformer as never);
    const target = { project: 'app', target: 'build' } as Target;

    const indexHtml = indexHtmlTransformFactory(
      { indexTransform: 'index.transform.ts', tsConfig: 'tsconfig.json' } as any,
      { workspaceRoot: '/root', target, logger } as any
    );

    const result = await indexHtml!('<html></html>');

    expect(mockedLoadModule).toHaveBeenCalledTimes(1);
    const [transformPath, tsConfigPath] = mockedLoadModule.mock.calls[0];
    expect(transformPath).toContain('index.transform.ts');
    expect(tsConfigPath).toContain('tsconfig.json');
    expect(transformer).toHaveBeenCalledWith(target, '<html></html>');
    expect(result).toBe('<html>transformed</html>');
  });
});
