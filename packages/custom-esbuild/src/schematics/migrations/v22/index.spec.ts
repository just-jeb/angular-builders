import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { SchematicTestHarness } from '@angular-builders/common/schematics/testing';

// Run the migration through the REAL migrations.json collection so the `ng-update`
// wiring (factory path, schematic name) is exercised — not just the shared rule.
const COLLECTION = require.resolve('../../../../src/schematics/migrations.json');

describe('custom-esbuild migration-v22 (jiti loader) wiring', () => {
  it('runs via the collection and applies the jiti loader migration', async () => {
    const runner = new SchematicTestRunner('custom-esbuild-migrations', COLLECTION);
    const tree = await new SchematicTestHarness().createWorkspace({ projects: [{ name: 'app' }] });
    const pkg = JSON.parse(tree.readText('/package.json'));
    pkg.scripts = {
      ...(pkg.scripts ?? {}),
      'build-ts': "NODE_OPTIONS='--loader ts-node/esm' ng build",
    };
    pkg.devDependencies = { ...(pkg.devDependencies ?? {}), 'ts-node': '10.9.2' };
    tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));

    const out = (await runner.runSchematic('migration-v22', {}, tree)) as UnitTestTree;
    const result = JSON.parse(out.readText('/package.json'));
    expect(result.scripts['build-ts']).toBe('ng build');
    expect(result.devDependencies['ts-node']).toBeUndefined();
  });
});
