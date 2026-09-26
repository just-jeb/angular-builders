import { BuilderContext, Target } from '@angular-devkit/architect';
import { executeUnitTestBuilder } from '@angular/build';
import { json } from '@angular-devkit/core';
import { firstValueFrom, of } from 'rxjs';

import { CustomEsbuildUnitTestSchema } from '../custom-esbuild-schema';
import { executeCustomEsbuildUnitTestBuilder } from './index';

jest.mock('@angular/build', () => ({ executeUnitTestBuilder: jest.fn() }));
jest.mock('../load-plugins', () => ({ loadPlugins: jest.fn().mockResolvedValue([]) }));

const mockedExecuteUnitTestBuilder = executeUnitTestBuilder as jest.MockedFunction<
  typeof executeUnitTestBuilder
>;

describe('executeCustomEsbuildUnitTestBuilder', () => {
  const testTarget: Target = { project: 'app', target: 'test' };

  // Options as written in angular.json for the test target (plus configurations),
  // i.e. what `context.getTargetOptions(context.target)` returns before the CLI's
  // schema transform fills unset arrays with `[]`.
  let rawTestOptions: json.JsonObject | null;

  const context = {
    workspaceRoot: '/workspace',
    logger: {},
    target: testTarget,
    getTargetOptions: jest.fn(async (target: Target) =>
      target === testTarget ? rawTestOptions : {}
    ),
  } as unknown as BuilderContext;

  const baseOptions = {
    buildTarget: 'app:build',
    tsConfig: 'tsconfig.spec.json',
  } as CustomEsbuildUnitTestSchema;

  async function delegatedOptions(
    options: Partial<CustomEsbuildUnitTestSchema>,
    builderContext: BuilderContext = context
  ) {
    await firstValueFrom(
      executeCustomEsbuildUnitTestBuilder({ ...baseOptions, ...options }, builderContext)
    );

    return mockedExecuteUnitTestBuilder.mock.calls[0][0];
  }

  beforeEach(() => {
    jest.clearAllMocks();
    rawTestOptions = {};
    mockedExecuteUnitTestBuilder.mockReturnValue(of({ success: true }) as never);
  });

  // Angular CLI fills unset array options with `[]` for every builder that is not
  // `@angular/build:*`, and `@angular/build` treats an empty array as user-provided.
  it.each([
    'browsers',
    'coverageInclude',
    'coverageExclude',
    'coverageReporters',
    'reporters',
    'setupFiles',
    'exclude',
    'plugins',
  ] as const)(
    'should not pass an empty %s array that is not in angular.json to the Angular builder',
    async option => {
      const delegated = await delegatedOptions({ [option]: [] });

      expect(delegated).not.toHaveProperty(option);
    }
  );

  it.each(['include', 'coverageReporters', 'reporters'] as const)(
    'should pass an explicit empty %s array from angular.json to the Angular builder',
    async option => {
      rawTestOptions = { [option]: [] };

      const delegated = await delegatedOptions({ [option]: [] });

      expect(delegated).toHaveProperty(option, []);
    }
  );

  it('should keep an empty array for an option set in angular.json that a CLI flag emptied', async () => {
    rawTestOptions = { coverageReporters: ['html'] };

    const delegated = await delegatedOptions({ coverageReporters: [] });

    expect(delegated).toHaveProperty('coverageReporters', []);
  });

  it('should read the raw options of the test target being run', async () => {
    await delegatedOptions({});

    expect(context.getTargetOptions).toHaveBeenCalledWith(testTarget);
  });

  it('should drop empty arrays when the target has no raw options', async () => {
    rawTestOptions = null;

    const delegated = await delegatedOptions({ coverageReporters: [] });

    expect(delegated).not.toHaveProperty('coverageReporters');
  });

  it('should drop empty arrays when the builder runs without a target', async () => {
    const targetlessContext = { ...context, target: undefined } as unknown as BuilderContext;

    const delegated = await delegatedOptions({ coverageReporters: [] }, targetlessContext);

    expect(delegated).not.toHaveProperty('coverageReporters');
    expect(context.getTargetOptions).not.toHaveBeenCalledWith(undefined);
  });

  it('should pass non-empty array options to the Angular builder', async () => {
    const delegated = await delegatedOptions({
      browsers: ['chromium'],
      coverageInclude: ['src/**/*.ts'],
      coverageExclude: ['src/**/*.stories.ts'],
      coverageReporters: ['html'] as CustomEsbuildUnitTestSchema['coverageReporters'],
      reporters: ['junit'] as CustomEsbuildUnitTestSchema['reporters'],
      setupFiles: ['src/test-setup.ts'],
    });

    expect(delegated).toMatchObject({
      browsers: ['chromium'],
      coverageInclude: ['src/**/*.ts'],
      coverageExclude: ['src/**/*.stories.ts'],
      coverageReporters: ['html'],
      reporters: ['junit'],
      setupFiles: ['src/test-setup.ts'],
    });
  });

  it('should force the vitest runner', async () => {
    const delegated = await delegatedOptions({});

    expect(delegated.runner).toBe('vitest');
  });
});
