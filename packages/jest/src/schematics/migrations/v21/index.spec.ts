import { logging } from '@angular-devkit/core';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../../src/schematics/migrations.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('jest-migrations', COLLECTION);
}

async function seed(): Promise<UnitTestTree> {
  const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
  const pkg = JSON.parse(tree.readText('/package.json'));
  pkg.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    jest: '^29.0.0',
    'jest-environment-jsdom': '^29.0.0',
    jsdom: '^24.0.0',
  };
  tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
  tree.create(
    '/tsconfig.spec.json',
    JSON.stringify({ compilerOptions: { module: 'esnext', types: ['jest'] } }, null, 2),
  );
  return tree;
}

describe('jest @21 migration — deps + tsconfig', () => {
  it('bumps jest/jest-environment-jsdom/jsdom to 30/30/26', async () => {
    const out = (await runner().runSchematic('migration-v21', {}, await seed())) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies.jest).toBe('^30.0.0');
    expect(pkg.devDependencies['jest-environment-jsdom']).toBe('^30.0.0');
    expect(pkg.devDependencies.jsdom).toBe('^26.0.0');
  });

  it('patches tsconfig.spec.json to Node16 + isolatedModules', async () => {
    const out = (await runner().runSchematic('migration-v21', {}, await seed())) as UnitTestTree;
    const cfg = JSON.parse(out.readText('/tsconfig.spec.json'));
    expect(cfg.compilerOptions.module).toBe('Node16');
    expect(cfg.compilerOptions.moduleResolution).toBe('Node16');
    expect(cfg.compilerOptions.isolatedModules).toBe(true);
  });
});

describe('jest @21 migration — builder option renames', () => {
  async function seedWithTestOptions(options: Record<string, unknown>): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options,
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    return tree;
  }

  it('renames configPath → config', async () => {
    const tree = await seedWithTestOptions({ configPath: 'jest.config.js' });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['config']).toBe('jest.config.js');
    expect(opts['configPath']).toBeUndefined();
  });

  it('renames testPathPattern → testPathPatterns', async () => {
    const tree = await seedWithTestOptions({ testPathPattern: 'foo' });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['testPathPatterns']).toBe('foo');
    expect(opts['testPathPattern']).toBeUndefined();
  });
});

describe('jest @21 migration — strip removed mocks/options', () => {
  async function seedWithTestOptions(options: Record<string, unknown>): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options,
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    return tree;
  }

  it('strips removed globalMocks values, keeping supported ones', async () => {
    const tree = await seedWithTestOptions({
      globalMocks: ['matchMedia', 'styleTransform', 'getComputedStyle', 'doctype'],
    });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['globalMocks']).toEqual(['matchMedia']);
  });

  it('strips removed jest options', async () => {
    const tree = await seedWithTestOptions({
      browser: true,
      init: true,
      mapCoverage: true,
      testURL: 'http://localhost',
      timers: 'fake',
      ci: true,
    });
    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    for (const removed of ['browser', 'init', 'mapCoverage', 'testURL', 'timers']) {
      expect(opts[removed]).toBeUndefined();
    }
    expect(opts['ci']).toBe(true);
  });
});

describe('jest @21 migration — zoneless detection + advisories', () => {
  it('zone-based workspace → sets zoneless:false', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          const build = ws.projects.get('app')!.targets.get('build')!;
          build.options = { ...(build.options ?? {}), polyfills: ['zone.js'] };
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options: {},
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBe(false);
  });

  it('zoneless workspace → leaves zoneless unset (default true)', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options: {},
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('migration-v21', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBeUndefined();
  });

  it('emits Node16 and removed-mocks advisories', async () => {
    const messages: string[] = [];
    const r = new SchematicTestRunner('jest-migrations', COLLECTION);
    r.logger.subscribe((e: logging.LogEntry) => messages.push(e.message));

    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await r.runSchematic('migration-v21', {}, tree);

    const joined = messages.join('\n');
    expect(joined).toMatch(/Node16/);
    expect(joined).toMatch(/mock/i);
  });
});

describe('jest @21 migration — idempotency', () => {
  async function seedFull(): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const pkg = JSON.parse(tree.readText('/package.json'));
    pkg.devDependencies = { ...(pkg.devDependencies ?? {}), jest: '^29.0.0', jsdom: '^24.0.0' };
    tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
    tree.create(
      '/tsconfig.spec.json',
      JSON.stringify({ compilerOptions: { module: 'esnext', types: ['jest'] } }, null, 2),
    );
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          const build = ws.projects.get('app')!.targets.get('build')!;
          build.options = { ...(build.options ?? {}), polyfills: ['zone.js'] };
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-builders/jest:run',
            options: {
              configPath: 'jest.config.js',
              testPathPattern: 'foo',
              globalMocks: ['matchMedia', 'doctype'],
              browser: true,
            },
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    return tree;
  }

  it('run twice == run once', async () => {
    const once = (await runner().runSchematic('migration-v21', {}, await seedFull())) as UnitTestTree;
    const twice = (await runner().runSchematic('migration-v21', {}, once)) as UnitTestTree;

    const wsOnce = await readWorkspace(once);
    const wsTwice = await readWorkspace(twice);
    const optsOnce = wsOnce.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    const optsTwice = wsTwice.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(optsTwice).toEqual(optsOnce);

    const pkgOnce = JSON.parse(once.readText('/package.json'));
    const pkgTwice = JSON.parse(twice.readText('/package.json'));
    expect(pkgTwice.devDependencies).toEqual(pkgOnce.devDependencies);

    const cfgOnce = JSON.parse(once.readText('/tsconfig.spec.json'));
    const cfgTwice = JSON.parse(twice.readText('/tsconfig.spec.json'));
    expect(cfgTwice).toEqual(cfgOnce);

    expect(optsTwice['config']).toBe('jest.config.js');
    expect(optsTwice['configPath']).toBeUndefined();
    expect(optsTwice['testPathPatterns']).toBe('foo');
    expect(optsTwice['globalMocks']).toEqual(['matchMedia']);
    expect(optsTwice['browser']).toBeUndefined();
    expect(optsTwice['zoneless']).toBe(false);
    expect(pkgTwice.devDependencies.jest).toBe('^30.0.0');
  });
});
