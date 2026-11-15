import { loadIndexHtmlTransformer } from './load-index-html-transformer';
import { Target } from '@angular-devkit/architect';
import { loadModule } from '@angular-builders/common';
import { CustomEsbuildApplicationSchema } from './custom-esbuild-schema';

// Module loading is the responsibility of `@angular-builders/common` (covered by
// its own load-module.spec). Here we mock `loadModule` so this test exercises
// loadIndexHtmlTransformer's own wiring (passing the target and options to the transformer).
jest.mock('@angular-builders/common', () => ({ loadModule: jest.fn() }));

const mockedLoadModule = loadModule as jest.MockedFunction<typeof loadModule>;

describe('loadIndexHtmlTransformer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass the target and the builder options to the transformer', async () => {
    const transformIndexHtml = jest.fn();
    mockedLoadModule.mockResolvedValue(transformIndexHtml as never);
    const mockTarget = { project: 'test', target: 'test' } as Target;
    const mockOptions = { baseHref: '/app/' } as CustomEsbuildApplicationSchema;
    const transform = await loadIndexHtmlTransformer(
      'test/test-index-transform.js',
      './tsconfig.json',
      null as any,
      mockTarget,
      mockOptions
    );

    await transform('Hello world!');
    expect(transformIndexHtml).toHaveBeenCalledWith('Hello world!', mockTarget, mockOptions);
  });

  it('should keep two-argument transformers working', async () => {
    mockedLoadModule.mockResolvedValue(
      ((html: string, target: Target) => `${html} ${target.project}`) as never
    );
    const transform = await loadIndexHtmlTransformer(
      'test/test-index-transform.js',
      './tsconfig.json',
      null as any,
      { project: 'app', target: 'build' } as Target,
      {} as CustomEsbuildApplicationSchema
    );

    await expect(transform('Hello')).resolves.toBe('Hello app');
  });
});
