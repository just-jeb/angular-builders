import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../../src/schematics/collection.json');

describe('@angular-builders/custom-esbuild integration tests', () => {
  let runner: SchematicTestRunner;
  let tree: Tree;

  beforeEach(() => {
    runner = new SchematicTestRunner('custom-esbuild', collectionPath);
    tree = Tree.empty();
  });

  describe('ng-add flow', () => {
    it('should install custom-esbuild builder', async () => {
      const packageJson = {
        name: 'test-app',
        version: '1.0.0',
        devDependencies: {},
      };

      tree.create('package.json', JSON.stringify(packageJson, null, 2));

      const result = await runner
        .runSchematicAsync('ng-add', { skipInstall: true }, tree)
        .toPromise();

      const updated = JSON.parse(result.read('package.json')!.toString());
      expect(updated.devDependencies['@angular-builders/custom-esbuild']).toBeDefined();
    });
  });
});
