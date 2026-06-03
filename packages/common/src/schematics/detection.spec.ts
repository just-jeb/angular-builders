import * as path from 'path';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from './testing';
import { getProjectsToTarget, detectTestBuilder, isZoneless } from './detection';

async function load(tree: import('@angular-devkit/schematics/testing').UnitTestTree) {
  return readWorkspace(tree);
}

describe('getProjectsToTarget', () => {
  it('single project → that project', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    expect(getProjectsToTarget(await load(tree))).toEqual(['app']);
  });

  it('multi project + explicit option → just that one', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'a' }, { name: 'b' }],
    });
    expect(getProjectsToTarget(await load(tree), 'b')).toEqual(['b']);
  });

  it('multi project + no option + no default → all', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({
      projects: [{ name: 'a' }, { name: 'b' }],
    });
    expect(getProjectsToTarget(await load(tree)).sort()).toEqual(['a', 'b']);
  });
});

describe('detectTestBuilder', () => {
  // Apply a workspace mutation rule to a tree and return the updated tree.
  async function applyWorkspace(
    tree: import('@angular-devkit/schematics/testing').UnitTestTree,
    builder: string,
    options: Record<string, unknown> = {},
  ) {
    const rule = updateWorkspace((workspace) => {
      workspace.projects.get('app')!.targets.set('test', {
        builder,
        options: options as never,
      });
    });
    const { SchematicTestRunner } = await import('@angular-devkit/schematics/testing');
    const NG_COLLECTION = path.join(
      path.dirname(require.resolve('@schematics/angular/package.json')),
      'collection.json',
    );
    const runner = new SchematicTestRunner('t', NG_COLLECTION);
    return runner.callRule(rule, tree).toPromise() as Promise<typeof tree>;
  }

  it('returns "none" when no test target', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // application schematic may add no test target under zoneless/standalone defaults
    const ws = await load(tree);
    if (!ws.projects.get('app')!.targets.has('test')) {
      expect(detectTestBuilder(ws, 'app')).toBe('none');
    }
  });

  it('detects a dedicated :karma builder (webpack projects)', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree = await applyWorkspace(tree, '@angular-devkit/build-angular:karma');
    expect(detectTestBuilder(await load(tree), 'app')).toBe('karma');
  });

  it('detects Karma on a v22 :unit-test builder via runner option', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree = await applyWorkspace(tree, '@angular/build:unit-test', { runner: 'karma' });
    expect(detectTestBuilder(await load(tree), 'app')).toBe('karma');
  });

  it('detects Vitest on a :unit-test builder (runner "vitest" or unset)', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree = await applyWorkspace(tree, '@angular/build:unit-test', { runner: 'vitest' });
    expect(detectTestBuilder(await load(tree), 'app')).toBe('vitest');

    let tree2 = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree2 = await applyWorkspace(tree2, '@angular/build:unit-test');
    expect(detectTestBuilder(await load(tree2), 'app')).toBe('vitest');
  });
});

describe('isZoneless', () => {
  it('true when polyfills lack zone.js', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // modern application schematic is zoneless by default → no zone.js polyfill
    expect(isZoneless(tree, await load(tree), 'app')).toBe(true);
  });
});
