import { resolve } from 'node:path';
import type { logging } from '@angular-devkit/core';
import { loadModule } from './load-module';

const FIXTURES = resolve(__dirname, 'load-module.fixtures');
const TSCONFIG = resolve(FIXTURES, 'tsconfig.json');
const TSCONFIG_ALT = resolve(FIXTURES, 'tsconfig.alt.json');

// Minimal logger stub — loadModule no longer logs, but the signature requires one.
const logger = {
  warn: () => undefined,
  info: () => undefined,
  error: () => undefined,
} as unknown as logging.LoggerApi;

const fixture = (file: string) => resolve(FIXTURES, file);

describe('loadModule', () => {
  it.each([
    ['config.ts', 'ts'],
    ['config.mts', 'mts'],
    ['config.cts', 'cts'],
    ['config.js', 'js-cjs'],
    ['config.mjs', 'mjs'],
    ['config.cjs', 'cjs'],
  ])('loads %s', async (file, expected) => {
    const result = await loadModule<{ name: string }>(fixture(file), TSCONFIG, logger);
    expect(result).toEqual({ name: expected });
  });

  it('resolves JSON imports inside a TS config (regression: #816)', async () => {
    const result = await loadModule<{ name: string }>(
      fixture('config-json-import.ts'),
      TSCONFIG,
      logger
    );
    expect(result).toEqual({ name: 'from-json' });
  });

  it('loads an ESM config that uses top-level await', async () => {
    const result = await loadModule<{ name: string }>(fixture('config-tla.mjs'), TSCONFIG, logger);
    expect(result).toEqual({ name: 'tla' });
  });

  it('resolves tsconfig path aliases from the passed tsConfig', async () => {
    const result = await loadModule<{ name: string }>(fixture('config-alias.ts'), TSCONFIG, logger);
    expect(result).toEqual({ name: 'aliased-base' });
  });

  it('does NOT over-unwrap a double default export', async () => {
    const result = await loadModule<{ default: { name: string } }>(
      fixture('config-double-default.ts'),
      TSCONFIG,
      logger
    );
    // The outer default is unwrapped once; the inner { default: ... } is preserved.
    expect(result).toEqual({ default: { name: 'inner' } });
  });

  it('uses each tsConfig independently (regression: sticky-tsconfig)', async () => {
    const base = await loadModule<{ name: string }>(fixture('config-alias.ts'), TSCONFIG, logger);
    const alt = await loadModule<{ name: string }>(
      fixture('config-alias-alt.ts'),
      TSCONFIG_ALT,
      logger
    );
    expect(base).toEqual({ name: 'aliased-base' });
    expect(alt).toEqual({ name: 'aliased-alt' });
  });
});
