import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace as getWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../src/schematics/collection.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('custom-webpack', COLLECTION);
}

async function runNgAdd(tree: UnitTestTree, options: Record<string, unknown> = {}): Promise<UnitTestTree> {
  return runner().runSchematic('ng-add', options, tree) as Promise<UnitTestTree>;
}

async function builderOf(tree: UnitTestTree, project: string, target: string): Promise<string | undefined> {
  const ws = await getWorkspace(tree);
  return ws.projects.get(project)?.targets.get(target)?.builder;
}

async function optionsOf(tree: UnitTestTree, project: string, target: string): Promise<Record<string, unknown>> {
  const ws = await getWorkspace(tree);
  return (ws.projects.get(project)?.targets.get(target)?.options ?? {}) as Record<string, unknown>;
}

describe('custom-webpack ng-add', () => {
  it('rewrites build to :browser and serve to :dev-server, preserving options', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    const ws = await getWorkspace(tree);
    const proj = ws.projects.get('app')!;
    const originalBuildOptions = { ...(proj.targets.get('build')!.options ?? {}) };
    expect(Object.keys(originalBuildOptions).length).toBeGreaterThan(0);

    tree = await runNgAdd(tree);

    expect(await builderOf(tree, 'app', 'build')).toBe('@angular-builders/custom-webpack:browser');
    expect(await builderOf(tree, 'app', 'serve')).toBe('@angular-builders/custom-webpack:dev-server');

    const buildOptions = await optionsOf(tree, 'app', 'build');
    for (const key of Object.keys(originalBuildOptions)) {
      expect(buildOptions[key]).toEqual(originalBuildOptions[key]);
    }
  });

  it('adds the builder to devDependencies and schedules install', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });
    const run = runner();
    tree = (await run.runSchematic('ng-add', {}, tree)) as UnitTestTree;

    const pkg = JSON.parse(tree.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/custom-webpack']).toBeDefined();
    expect(run.tasks.some((t) => t.name === 'node-package')).toBe(true);
  });

  it('scaffolds webpack.config.js and wires customWebpackConfig when none exists', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    expect(tree.exists('/webpack.config.js')).toBe(false);
    tree = await runNgAdd(tree);

    expect(tree.exists('/webpack.config.js')).toBe(true);
    expect(tree.readText('/webpack.config.js')).toContain('module.exports');

    const buildOptions = await optionsOf(tree, 'app', 'build');
    expect(buildOptions['customWebpackConfig']).toEqual({ path: 'webpack.config.js' });
  });

  it('does NOT scaffold when a webpack.config.js already exists', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });
    tree.create('/webpack.config.js', '// my existing config\nmodule.exports = { mine: true };');

    tree = await runNgAdd(tree);

    expect(tree.readText('/webpack.config.js')).toContain('mine: true');
    const buildOptions = await optionsOf(tree, 'app', 'build');
    expect(buildOptions['customWebpackConfig']).toBeUndefined();
  });

  it('does NOT scaffold when customWebpackConfig is already referenced in build options', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    const { updateWorkspace } = await import('@schematics/angular/utility');
    tree = (await runner()
      .callRule(
        updateWorkspace((ws) => {
          const opts = ws.projects.get('app')!.targets.get('build')!.options!;
          opts['customWebpackConfig'] = { path: 'extra-webpack.config.js' };
        }),
        tree,
      )
      .toPromise()) as UnitTestTree;

    tree = await runNgAdd(tree);

    expect(tree.exists('/webpack.config.js')).toBe(false);
    const buildOptions = await optionsOf(tree, 'app', 'build');
    expect(buildOptions['customWebpackConfig']).toEqual({ path: 'extra-webpack.config.js' });
  });

  it('is idempotent: build already :browser → no-op rewrite, no second scaffold', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    tree = await runNgAdd(tree);
    const firstConfig = tree.readText('/webpack.config.js');

    tree = await runNgAdd(tree);

    expect(await builderOf(tree, 'app', 'build')).toBe('@angular-builders/custom-webpack:browser');
    expect(await builderOf(tree, 'app', 'serve')).toBe('@angular-builders/custom-webpack:dev-server');
    expect(tree.readText('/webpack.config.js')).toBe(firstConfig);
  });

  it('targets a specific project via --project in a multi-project workspace', async () => {
    const harness = new SchematicTestHarness();
    let tree = await harness.createWorkspace({ projects: [{ name: 'a' }, { name: 'b' }] });

    tree = await runNgAdd(tree, { project: 'b' });

    expect(await builderOf(tree, 'b', 'build')).toBe('@angular-builders/custom-webpack:browser');
    expect(await builderOf(tree, 'a', 'build')).not.toBe('@angular-builders/custom-webpack:browser');
  });
});
