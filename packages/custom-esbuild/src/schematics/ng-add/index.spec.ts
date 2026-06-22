import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../src/schematics/collection.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('custom-esbuild', COLLECTION);
}

async function ngAdd(
  tree: UnitTestTree,
  options: Record<string, unknown> = {}
): Promise<UnitTestTree> {
  return runner().runSchematic('ng-add', options, tree);
}

describe('custom-esbuild ng-add: build + serve rewrite', () => {
  it('rewrites build → :application and serve → :dev-server, adding self to devDeps', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });

    const seeded = (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', {
            builder: '@angular/build:application',
            options: { tsConfig: 'tsconfig.app.json', outputPath: 'dist/app' },
          });
          project.targets.set('serve', {
            builder: '@angular/build:dev-server',
            options: { buildTarget: 'app:build' },
          });
        }),
        tree
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app' });

    const ws = await readWorkspace(out);
    const build = ws.projects.get('app')!.targets.get('build')!;
    const serve = ws.projects.get('app')!.targets.get('serve')!;

    expect(build.builder).toBe('@angular-builders/custom-esbuild:application');
    expect((build.options as Record<string, unknown>).tsConfig).toBe('tsconfig.app.json');
    expect((build.options as Record<string, unknown>).outputPath).toBe('dist/app');

    expect(serve.builder).toBe('@angular-builders/custom-esbuild:dev-server');
    expect((serve.options as Record<string, unknown>).buildTarget).toBe('app:build');

    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/custom-esbuild']).toBeDefined();
  });
});

describe('custom-esbuild ng-add: webpack-build guard (spec §12.3)', () => {
  async function seedWebpackBuild(builder: string): Promise<UnitTestTree> {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    return (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder, options: { outputPath: 'dist/app' } });
          project.targets.set('serve', {
            builder: '@angular-devkit/build-angular:dev-server',
            options: { buildTarget: 'app:build' },
          });
        }),
        tree
      )
      .toPromise()) as UnitTestTree;
  }

  it('does NOT rewrite an @angular-devkit/build-angular:browser build; logs an advisory', async () => {
    const seeded = await seedWebpackBuild('@angular-devkit/build-angular:browser');
    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe(entry => logs.push(entry.message));
    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('build')!.builder).toBe(
      '@angular-devkit/build-angular:browser'
    );
    expect(ws.projects.get('app')!.targets.get('serve')!.builder).toBe(
      '@angular-devkit/build-angular:dev-server'
    );
    expect(logs.some(m => m.includes('use-application-builder'))).toBe(true);
    expect(logs.some(m => m.includes('--from-webpack'))).toBe(true);
  });

  it('does NOT rewrite a custom-webpack:browser build; logs an advisory', async () => {
    const seeded = await seedWebpackBuild('@angular-builders/custom-webpack:browser');
    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe(entry => logs.push(entry.message));
    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('build')!.builder).toBe(
      '@angular-builders/custom-webpack:browser'
    );
    expect(logs.some(m => m.includes('use-application-builder'))).toBe(true);
  });

  it('--from-webpack forces the mechanical build/serve rewrite from a webpack build', async () => {
    const seeded = await seedWebpackBuild('@angular-devkit/build-angular:browser');
    const out = await ngAdd(seeded, { project: 'app', fromWebpack: true });
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('build')!.builder).toBe(
      '@angular-builders/custom-esbuild:application'
    );
    expect(
      (ws.projects.get('app')!.targets.get('build')!.options as Record<string, unknown>).outputPath
    ).toBe('dist/app');
    expect(ws.projects.get('app')!.targets.get('serve')!.builder).toBe(
      '@angular-builders/custom-esbuild:dev-server'
    );
  });
});

describe('custom-esbuild ng-add: Vitest test target', () => {
  it('auto-rewrites @angular/build:unit-test → :unit-test and wires buildTarget', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const seeded = (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', {
            builder: '@angular/build:application',
            options: { tsConfig: 'tsconfig.app.json' },
          });
          project.targets.set('test', {
            builder: '@angular/build:unit-test',
            options: { tsConfig: 'tsconfig.spec.json' },
          });
        }),
        tree
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app' });
    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test')!;
    expect(test.builder).toBe('@angular-builders/custom-esbuild:unit-test');
    expect((test.options as Record<string, unknown>).buildTarget).toBe('app:build');
    expect((test.options as Record<string, unknown>).tsConfig).toBe('tsconfig.spec.json');
  });
});

describe('custom-esbuild ng-add: Karma / Jest test target', () => {
  it('leaves a Karma test target untouched and logs an advisory', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const seeded = (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.set('test', {
            builder: '@angular-devkit/build-angular:karma',
            options: { karmaConfig: 'karma.conf.js' },
          });
        }),
        tree
      )
      .toPromise()) as UnitTestTree;

    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe(entry => logs.push(entry.message));
    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe(
      '@angular-devkit/build-angular:karma'
    );
    expect(
      (ws.projects.get('app')!.targets.get('test')!.options as Record<string, unknown>).karmaConfig
    ).toBe('karma.conf.js');
    expect(logs.some(m => m.includes('custom-esbuild:unit-test'))).toBe(true);
  });

  it('leaves a Jest test target untouched and logs an advisory', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const seeded = (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.set('test', { builder: '@angular-builders/jest:run', options: {} });
        }),
        tree
      )
      .toPromise()) as UnitTestTree;

    const r = runner();
    const logs: string[] = [];
    r.logger.subscribe(entry => logs.push(entry.message));
    const out = await r.runSchematic('ng-add', { project: 'app' }, seeded);
    const ws = await readWorkspace(out);
    expect(ws.projects.get('app')!.targets.get('test')!.builder).toBe('@angular-builders/jest:run');
    expect(logs.some(m => m.includes('custom-esbuild:unit-test'))).toBe(true);
  });
});

describe('custom-esbuild ng-add: --unit-test flag', () => {
  it('force-creates a Vitest unit-test target when none exists', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const seeded = (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.delete('test');
        }),
        tree
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app', unitTest: true });
    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test');
    expect(test).toBeDefined();
    expect(test!.builder).toBe('@angular-builders/custom-esbuild:unit-test');
    expect((test!.options as Record<string, unknown>).buildTarget).toBe('app:build');
  });

  it('rewrites an existing Vitest target the same way under --unit-test', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const seeded = (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.set('test', { builder: '@angular/build:unit-test', options: {} });
        }),
        tree
      )
      .toPromise()) as UnitTestTree;

    const out = await ngAdd(seeded, { project: 'app', unitTest: true });
    const ws = await readWorkspace(out);
    const test = ws.projects.get('app')!.targets.get('test')!;
    expect(test.builder).toBe('@angular-builders/custom-esbuild:unit-test');
    expect((test.options as Record<string, unknown>).buildTarget).toBe('app:build');
  });
});

describe('custom-esbuild ng-add: idempotency', () => {
  it('is a no-op when build is already :application (running twice == once)', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const seeded = (await runner()
      .callRule(
        updateWorkspace(workspace => {
          const project = workspace.projects.get('app')!;
          project.targets.set('build', { builder: '@angular/build:application', options: {} });
          project.targets.set('serve', {
            builder: '@angular/build:dev-server',
            options: { buildTarget: 'app:build' },
          });
          project.targets.set('test', {
            builder: '@angular/build:unit-test',
            options: { tsConfig: 'tsconfig.spec.json' },
          });
        }),
        tree
      )
      .toPromise()) as UnitTestTree;

    const once = await ngAdd(seeded, { project: 'app' });
    const twice = await ngAdd(once, { project: 'app' });

    const wsOnce = await readWorkspace(once);
    const wsTwice = await readWorkspace(twice);

    for (const ws of [wsOnce, wsTwice]) {
      const project = ws.projects.get('app')!;
      expect(project.targets.get('build')!.builder).toBe(
        '@angular-builders/custom-esbuild:application'
      );
      expect(project.targets.get('serve')!.builder).toBe(
        '@angular-builders/custom-esbuild:dev-server'
      );
      const test = project.targets.get('test')!;
      expect(test.builder).toBe('@angular-builders/custom-esbuild:unit-test');
      expect((test.options as Record<string, unknown>).buildTarget).toBe('app:build');
      expect((test.options as Record<string, unknown>).tsConfig).toBe('tsconfig.spec.json');
    }

    expect(twice.readText('/angular.json')).toBe(once.readText('/angular.json'));
  });
});
