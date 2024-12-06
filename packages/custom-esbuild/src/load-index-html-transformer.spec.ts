import { loadIndexHtmlTransformer } from './load-index-html-transformer';
import { Target } from '@angular-devkit/architect';

describe('loadIndexHtmlTransformer', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should pass the target to the transformer', async () => {
    const transformIndexHtml = jest.fn();
    jest.mock('test/test-index-transform.js', () => transformIndexHtml, { virtual: true });
    const mockTarget = { project: 'test', target: 'test' } as Target;
    const transform = await loadIndexHtmlTransformer(
      'test/test-index-transform.js',
      './tsconfig.json',
      null as any,
      mockTarget
    );

    await transform('Hello world!');
    expect(transformIndexHtml).toHaveBeenCalledWith('Hello world!', mockTarget);
  });
});
