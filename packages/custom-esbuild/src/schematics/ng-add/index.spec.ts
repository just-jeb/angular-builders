import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../src/schematics/collection.json');

function runner(): SchematicTestRunner {
  return new SchematicTestRunner('custom-esbuild', COLLECTION);
}

async function ngAdd(
  tree: UnitTestTree,
  options: Record<string, unknown> = {},
): Promise<UnitTestTree> {
  return runner().runSchematic('ng-add', options, tree);
}

describe('custom-esbuild ng-add: build + serve rewrite', () => {
  it('rewrites build → :application and serve → :dev-server, adding self to devDeps', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });

    const seeded = (await runner()
      .callRule(
        updateWorkspace((workspace) => {
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
        tree,
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
