import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { logging } from '@angular-devkit/core';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../src/schematics/collection.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('jest', COLLECTION);
}

describe('jest ng-add (no Karma)', () => {
  it('adds the jest stack to devDependencies and schedules install', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const r = runner();
    const out = (await r.runSchematic('ng-add', {}, tree)) as UnitTestTree;

    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/jest']).toBeDefined();
    expect(pkg.devDependencies['jest']).toBeDefined();
    expect(pkg.devDependencies['jest-environment-jsdom']).toBeDefined();
    // jest-preset-angular resolves transitively from @angular-builders/jest, so ng-add does
    // not add it to the consuming project's devDependencies.
    expect(pkg.devDependencies['jest-preset-angular']).toBeUndefined();
    expect(r.tasks.length).toBeGreaterThan(0);
  });

  it('rewrites the test target to @angular-builders/jest:run', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-devkit/build-angular:karma',
            options: {},
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe(
      '@angular-builders/jest:run',
    );
  });

  it('sets zoneless to match detection (zoneless workspace → true)', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const out = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBe(true);
  });
});

describe('jest ng-add (Karma present)', () => {
  async function karmaWorkspace(): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular-devkit/build-angular:karma',
            options: { polyfills: ['zone.js', 'zone.js/testing'] },
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const pkg = JSON.parse(tree.readText('/package.json'));
    pkg.devDependencies = {
      ...(pkg.devDependencies ?? {}),
      karma: '^6.4.0',
      'karma-chrome-launcher': '^3.2.0',
      'karma-jasmine': '^5.1.0',
      jasmine: '^5.1.0',
      'jasmine-core': '^5.1.0',
      '@types/jasmine': '^5.1.0',
    };
    tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
    tree.create('/karma.conf.js', '// karma config');
    tree.create('/src/test.ts', '// karma entry');
    tree.create(
      '/tsconfig.spec.json',
      JSON.stringify(
        { compilerOptions: { types: ['jasmine'] }, files: ['src/test.ts', 'src/polyfills.ts'] },
        null,
        2,
      ),
    );
    return tree;
  }

  it('removes karma/jasmine devDependencies', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await karmaWorkspace())) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    for (const dep of [
      'karma',
      'karma-chrome-launcher',
      'karma-jasmine',
      'jasmine',
      'jasmine-core',
      '@types/jasmine',
    ]) {
      expect(pkg.devDependencies[dep]).toBeUndefined();
    }
  });

  it('deletes karma.conf.js and src/test.ts', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await karmaWorkspace())) as UnitTestTree;
    expect(out.exists('/karma.conf.js')).toBe(false);
    expect(out.exists('/src/test.ts')).toBe(false);
  });

  it('fixes tsconfig.spec.json (types jasmine→jest, drops test.ts)', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await karmaWorkspace())) as UnitTestTree;
    const cfg = JSON.parse(out.readText('/tsconfig.spec.json'));
    expect(cfg.compilerOptions.types).toEqual(['jest']);
    expect(cfg.files).toEqual(['src/polyfills.ts']);
  });
});

describe('jest ng-add (Vitest present)', () => {
  async function vitestWorkspace(): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular/build:unit-test',
            options: { buildTarget: 'app:build', tsConfig: 'tsconfig.spec.json' },
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    tree.create(
      '/tsconfig.spec.json',
      JSON.stringify(
        { compilerOptions: { types: ['vitest/globals'] }, include: ['src/**/*.spec.ts'] },
        null,
        2,
      ),
    );
    return tree;
  }

  it('rewrites the Vitest test target to @angular-builders/jest:run', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await vitestWorkspace())) as UnitTestTree;
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe(
      '@angular-builders/jest:run',
    );
  });

  it('fixes tsconfig.spec.json types (vitest globals → jest)', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await vitestWorkspace())) as UnitTestTree;
    const cfg = JSON.parse(out.readText('/tsconfig.spec.json'));
    expect(cfg.compilerOptions.types).toEqual(['jest']);
  });

  it('logs an advisory about manually porting vi.* / vitest specs to Jest', async () => {
    const messages: string[] = [];
    const r = runner();
    r.logger.subscribe((e: logging.LogEntry) => messages.push(e.message));
    await r.runSchematic('ng-add', {}, await vitestWorkspace());
    const joined = messages.join('\n');
    expect(joined).toMatch(/vitest/i);
    expect(joined).toMatch(/vi\.\*|manual/i);
  });

  it('does not delete files or remove devDependencies (lighter than Karma)', async () => {
    const tree = await vitestWorkspace();
    const beforeDeps = JSON.parse(tree.readText('/package.json')).devDependencies ?? {};
    const out = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const afterDeps = JSON.parse(out.readText('/package.json')).devDependencies ?? {};
    for (const dep of Object.keys(beforeDeps)) {
      expect(afterDeps[dep]).toBeDefined();
    }
    expect(out.exists('/karma.conf.js')).toBe(false);
  });

  it('strips the prior :unit-test options (runner, buildTarget) from the jest target', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await vitestWorkspace())) as UnitTestTree;
    const ws = await readWorkspace(out);
    const options = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    // buildTarget belongs to the Vitest unit-test builder; it must not leak to the Jest builder.
    expect(options['buildTarget']).toBeUndefined();
    expect(options['runner']).toBeUndefined();
    expect(options['zoneless']).toBe(true);
  });
});

describe('jest ng-add (v22 Karma via :unit-test runner option)', () => {
  // Angular 22 default (esbuild) apps express Karma as @angular/build:unit-test + runner:"karma",
  // not a dedicated :karma builder. The schematic must detect this as Karma and rewrite to Jest
  // with a clean option set (no stale `runner`).
  async function v22KarmaWorkspace(): Promise<UnitTestTree> {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          ws.projects.get('app')!.targets.set('test', {
            builder: '@angular/build:unit-test',
            options: { runner: 'karma', buildTarget: 'app:build' },
          });
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    return tree;
  }

  it('rewrites to @angular-builders/jest:run and drops the stale runner option', async () => {
    const out = (await runner().runSchematic('ng-add', {}, await v22KarmaWorkspace())) as UnitTestTree;
    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test')!;
    expect(test.builder).toBe('@angular-builders/jest:run');
    const options = test.options as Record<string, unknown>;
    expect(options['runner']).toBeUndefined();
    expect(options['buildTarget']).toBeUndefined();
  });
});

describe('jest ng-add (zoneless detection + idempotency)', () => {
  it('sets zoneless:false when zone.js is in build polyfills', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner()
      .callRule(
        updateWorkspace((ws) => {
          const build = ws.projects.get('app')!.targets.get('build')!;
          build.options = { ...(build.options ?? {}), polyfills: ['zone.js'] };
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));

    const out = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const ws = await readWorkspace(out);
    const opts = ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>;
    expect(opts['zoneless']).toBe(false);
  });

  it('is idempotent: re-running on an already-jest workspace keeps :run', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const once = (await runner().runSchematic('ng-add', {}, tree)) as UnitTestTree;
    const twice = (await runner().runSchematic('ng-add', {}, once)) as UnitTestTree;

    const ws = await readWorkspace(twice);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe(
      '@angular-builders/jest:run',
    );
    const pkg = JSON.parse(twice.readText('/package.json'));
    expect(pkg.devDependencies['jest']).toBe('^30.0.0');
  });
});
