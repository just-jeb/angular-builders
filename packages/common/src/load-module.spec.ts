import * as path from 'node:path';

import { loadModule } from './load-module';

const tsConfig = path.resolve(__dirname, '../tsconfig.json');
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
});
