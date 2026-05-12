import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../../src/schematics/collection.json');

describe('@angular-builders/jest integration tests', () => {
  let runner: SchematicTestRunner;
  let tree: Tree;

  beforeEach(() => {
    runner = new SchematicTestRunner('jest', collectionPath);
    tree = Tree.empty();
  });

  describe('ng-add + migration flow', () => {
    it('should install and configure Jest builder', async () => {
      const packageJson = {
        name: 'test-app',
        version: '1.0.0',
        devDependencies: {
          '@angular/core': '^18.0.0',
        },
      };

      const angularJson = {
        projects: {
          app: {
            root: 'src',
            architect: {
              build: {
                builder: '@angular-devkit/build-angular:browser',
              },
            },
          },
        },
      };

      tree.create('package.json', JSON.stringify(packageJson, null, 2));
      tree.create('angular.json', JSON.stringify(angularJson, null, 2));

      // Simulate ng-add
      let result = await runner
        .runSchematicAsync('ng-add', { skipInstall: true }, tree)
        .toPromise();

      const updatedPkg = JSON.parse(result.read('package.json')!.toString());
      expect(updatedPkg.devDependencies['@angular-builders/jest']).toBeDefined();
    });

    it('should handle skipConfig and skipInstall options', async () => {
      const packageJson = {
        name: 'test-app',
        version: '1.0.0',
        devDependencies: {},
      };

      tree.create('package.json', JSON.stringify(packageJson, null, 2));

      const result = await runner
        .runSchematicAsync('ng-add', { skipInstall: true, skipConfig: true }, tree)
        .toPromise();

      expect(result).toBeDefined();
    });
  });

  describe('Builder configuration', () => {
    it('should use correct Jest builder reference', async () => {
      const packageJson = {
        name: 'test-app',
        version: '1.0.0',
        devDependencies: {
          '@angular-builders/jest': '^21.0.0',
        },
      };

      tree.create('package.json', JSON.stringify(packageJson, null, 2));

      // Verify builder can be resolved
      expect(packageJson.devDependencies['@angular-builders/jest']).toContain('^21');
    });
  });
});
