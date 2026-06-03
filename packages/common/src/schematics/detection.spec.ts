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
  it('returns "none" when no test target', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // application schematic may add no test target under zoneless/standalone defaults
    const ws = await load(tree);
    if (!ws.projects.get('app')!.targets.has('test')) {
      expect(detectTestBuilder(ws, 'app')).toBe('none');
    }
  });

  it('detects karma', async () => {
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    tree = await (async () => {
      const rule = updateWorkspace((workspace) => {
        workspace.projects.get('app')!.targets.set('test', {
          builder: '@angular-devkit/build-angular:karma',
          options: {},
        });
      });
      // apply the rule via a runner-less call:
      const { SchematicTestRunner } = await import('@angular-devkit/schematics/testing');
      const NG_COLLECTION = path.join(
        path.dirname(require.resolve('@schematics/angular/package.json')),
        'collection.json',
      );
      const runner = new SchematicTestRunner('t', NG_COLLECTION);
      return runner.callRule(rule, tree).toPromise() as Promise<typeof tree>;
    })();
    expect(detectTestBuilder(await load(tree), 'app')).toBe('karma');
  });
});

describe('isZoneless', () => {
  it('true when polyfills lack zone.js', async () => {
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    // modern application schematic is zoneless by default → no zone.js polyfill
    expect(isZoneless(tree, await load(tree), 'app')).toBe(true);
  });
});
