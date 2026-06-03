import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from './testing';
import {
  setBuilderForTarget,
  addBuilderDevDependency,
  removeDevDependencies,
  removeFilesIfPresent,
  editJsonFile,
} from './rules';

const NG = path.join(path.dirname(require.resolve('@schematics/angular/package.json')), 'collection.json');
const runner = () => new SchematicTestRunner('t', NG);

describe('setBuilderForTarget', () => {
  it('rewrites the builder and merges options', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const out = (await runner()
      .callRule(setBuilderForTarget('app', 'build', '@angular-builders/custom-esbuild:application', { foo: 1 }), tree)
      .toPromise()) as UnitTestTree;
    const ws = await readWorkspace(out);
    const target = ws.projects.get('app')!.targets.get('build')!;
    expect(target.builder).toBe('@angular-builders/custom-esbuild:application');
    expect((target.options as Record<string, unknown>)['foo']).toBe(1);
  });

  it('replaceOptions discards the previous builder options', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // Seed a :unit-test-shaped test target whose options must NOT carry over.
    const seeded = (await runner()
      .callRule(setBuilderForTarget('app', 'test', '@angular/build:unit-test', { runner: 'karma', buildTarget: 'app:build' }), tree)
      .toPromise()) as UnitTestTree;
    const out = (await runner()
      .callRule(
        setBuilderForTarget('app', 'test', '@angular-builders/jest:run', { zoneless: true }, { replaceOptions: true }),
        seeded,
      )
      .toPromise()) as UnitTestTree;
    const ws = await readWorkspace(out);
    const target = ws.projects.get('app')!.targets.get('test')!;
    expect(target.builder).toBe('@angular-builders/jest:run');
    const options = target.options as Record<string, unknown>;
    expect(options['runner']).toBeUndefined();
    expect(options['buildTarget']).toBeUndefined();
    expect(options['zoneless']).toBe(true);
  });
});

describe('addBuilderDevDependency', () => {
  it('adds the package to devDependencies', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const out = (await runner()
      .callRule(addBuilderDevDependency('@angular-builders/jest', '~22.0.0', { install: false }), tree)
      .toPromise()) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies['@angular-builders/jest']).toBe('~22.0.0');
  });
});

describe('removeDevDependencies', () => {
  it('removes only present deps and is safe on absent ones', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree.overwrite(
      '/package.json',
      JSON.stringify({ devDependencies: { karma: '^6.0.0', jasmine: '^5.0.0' } }, null, 2),
    );
    const out = (await runner()
      .callRule(removeDevDependencies(['karma', 'not-there']), tree)
      .toPromise()) as UnitTestTree;
    const pkg = JSON.parse(out.readText('/package.json'));
    expect(pkg.devDependencies.karma).toBeUndefined();
    expect(pkg.devDependencies.jasmine).toBe('^5.0.0');
  });
});

describe('removeFilesIfPresent', () => {
  it('deletes present files, ignores absent', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree.create('/karma.conf.js', '// karma');
    const out = (await runner()
      .callRule(removeFilesIfPresent(['/karma.conf.js', '/nope.js']), tree)
      .toPromise()) as UnitTestTree;
    expect(out.exists('/karma.conf.js')).toBe(false);
  });
});

describe('editJsonFile', () => {
  it('mutates JSON via JSONFile', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree.create('/tsconfig.spec.json', JSON.stringify({ compilerOptions: { types: ['jasmine'] } }, null, 2));
    const out = (await runner()
      .callRule(
        editJsonFile('/tsconfig.spec.json', (json) => json.modify(['compilerOptions', 'types'], ['jest'])),
        tree,
      )
      .toPromise()) as UnitTestTree;
    const cfg = JSON.parse(out.readText('/tsconfig.spec.json'));
    expect(cfg.compilerOptions.types).toEqual(['jest']);
  });
});
