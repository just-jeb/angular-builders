import { readWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from './testing';

describe('SchematicTestHarness', () => {
  it('builds a single-project workspace with angular.json', async () => {
    const harness = new SchematicTestHarness();
    const tree = await harness.createWorkspace({ projects: [{ name: 'app' }] });

    expect(tree.exists('/angular.json')).toBe(true);
    const workspace = await readWorkspace(tree);
    expect([...workspace.projects.keys()]).toEqual(['app']);
    // application schematic wires a build target by default
    expect(workspace.projects.get('app')!.targets.has('build')).toBe(true);
  });

  it('builds a multi-project workspace', async () => {
    const harness = new SchematicTestHarness();
    const tree = await harness.createWorkspace({
      projects: [{ name: 'app1' }, { name: 'app2' }],
    });
    const workspace = await readWorkspace(tree);
    expect([...workspace.projects.keys()].sort()).toEqual(['app1', 'app2']);
  });
});
