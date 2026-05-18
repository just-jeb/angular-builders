import * as path from 'node:path';

import { loadModule } from './load-module';

const tsConfig = path.resolve(__dirname, '../tsconfig.json');
const tsConfigBundler = path.resolve(__dirname, '../tests/fixtures/tsconfig.bundler.json');
const fixturesDir = path.resolve(__dirname, '../tests/fixtures');

describe('loadModule', () => {
  it('loads two TypeScript fixtures concurrently without losing ts-node registration', async () => {
    // ts-node is registered+unregistered around each .ts load. Two parallel
    // loads must each see a working register-require-unregister window, with
    // neither call killing the other's compilation. (See PR #1659.)
    const [a, b] = await Promise.all([
      loadModule<{ name: string; value: number }>(
        path.join(fixturesDir, 'concurrent-a.ts'),
        tsConfig
      ),
      loadModule<{ name: string; value: number }>(
        path.join(fixturesDir, 'concurrent-b.ts'),
        tsConfig
      ),
    ]);

    expect(a).toEqual({ name: 'concurrent-a', value: 1 });
    expect(b).toEqual({ name: 'concurrent-b', value: 2 });
  });

  it('loads a TypeScript fixture when the tsconfig specifies moduleResolution:bundler (regression for #1197, #1213)', async () => {
    // Before the fix, ts-node was registered with module:CommonJS while the user tsconfig
    // specified moduleResolution:bundler, causing TS5095/TS5110 errors. The fix adds a
    // moduleResolution:node override in ts-node compiler options, which is safe under
    // transpileOnly:true.
    const result = await loadModule<{ name: string; value: number }>(
      path.join(fixturesDir, 'simple.ts'),
      tsConfigBundler
    );

    expect(result).toEqual({ name: 'simple', value: 42 });
  });

  it('loads two TypeScript fixtures with different tsconfigs sequentially without ts-node registration bleeding', async () => {
    // The original bug (#1197): the second loadModule call with a different tsconfig
    // would be silently skipped (first registration wins, process-global). With the
    // per-load register+unregister model, each call uses its own tsconfig.
    const resultFromBundlerConfig = await loadModule<{ name: string; value: number }>(
      path.join(fixturesDir, 'simple.ts'),
      tsConfigBundler
    );
    const resultFromDefaultConfig = await loadModule<{ name: string; value: number }>(
      path.join(fixturesDir, 'concurrent-a.ts'),
      tsConfig
    );

    expect(resultFromBundlerConfig).toEqual({ name: 'simple', value: 42 });
    expect(resultFromDefaultConfig).toEqual({ name: 'concurrent-a', value: 1 });
  });
});
