import { logging } from '@angular-devkit/core';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { updateWorkspace } from '@schematics/angular/utility';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

const COLLECTION = require.resolve('../../../../src/schematics/migrations.json');

function makeRunner(): { runner: SchematicTestRunner; messages: string[] } {
  const runner = new SchematicTestRunner('jest-migrations', COLLECTION);
  const messages: string[] = [];
  runner.logger.subscribe((e: logging.LogEntry) => messages.push(e.message));
  return { runner, messages };
}

function snapshot(tree: UnitTestTree): Record<string, string> {
  const out: Record<string, string> = {};
  tree.visit((path) => {
    try {
      out[path] = tree.readText(path);
    } catch {
      // skip binary files (e.g. favicon.ico)
      out[path] = '<binary>';
    }
  });
  return out;
}

describe('jest @22 migration — advisory only', () => {
  it('warns about isolatedModules default flip (#2191)', async () => {
    const { runner, messages } = makeRunner();
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner.runSchematic('migration-v22', {}, tree);
    expect(messages.join('\n')).toMatch(/isolatedModules/);
  });

  it('warns about per-project coverage path when projectRoot !== workspaceRoot (#2212)', async () => {
    const { runner, messages } = makeRunner();
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner.runSchematic('migration-v22', {}, tree);
    expect(messages.join('\n')).toMatch(/coverage/i);
  });

  it('does NOT warn about coverage when projectRoot === workspaceRoot', async () => {
    const { runner, messages } = makeRunner();
    let tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    await runner
      .callRule(
        updateWorkspace((ws) => {
          (ws.projects.get('app') as { root: string }).root = '';
        }),
        tree,
      )
      .forEach((t) => (tree = t as UnitTestTree));
    await runner.runSchematic('migration-v22', {}, tree);
    expect(messages.join('\n')).not.toMatch(/coverage/i);
  });

  it('mutates no files', async () => {
    const { runner } = makeRunner();
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const before = snapshot(tree);
    const out = (await runner.runSchematic('migration-v22', {}, tree)) as UnitTestTree;
    const after = snapshot(out);
    expect(after).toEqual(before);
  });
});
