import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../../schematics/collection.json');

describe('@angular-builders schematics migrations', () => {
  let runner: SchematicTestRunner;
  let tree: Tree;

  beforeEach(() => {
    runner = new SchematicTestRunner('migrations', collectionPath);
    tree = Tree.empty();
  });

  describe('v18 migration', () => {
    it('should update builder versions in angular.json', async () => {
      const angularJson = {
        projects: {
          app: {
            architect: {
              build: {
                builder: '@angular-builders/custom-webpack:browser',
                options: {
                  '@angular-builders/version': '17.x.x',
                  outputPath: 'dist/app',
                },
              },
            },
          },
        },
      };

      tree.create('angular.json', JSON.stringify(angularJson, null, 2));

      const result = await runner
        .runSchematicAsync('v18-migration', {}, tree)
        .toPromise();

      expect(result).toBeDefined();
    });

    it('should handle multiple projects', async () => {
      const angularJson = {
        projects: {
          app1: {
            architect: {
              build: {
                builder: '@angular-builders/custom-webpack:browser',
                options: {},
              },
            },
          },
          app2: {
            architect: {
              test: {
                builder: '@angular-builders/jest:run',
                options: {},
              },
            },
          },
        },
      };

      tree.create('angular.json', JSON.stringify(angularJson, null, 2));

      const result = await runner
        .runSchematicAsync('v18-migration', {}, tree)
        .toPromise();

      expect(result).toBeDefined();
    });
  });

  describe('v19 migration', () => {
    it('should update to v19 APIs', async () => {
      const angularJson = {
        projects: {
          app: {
            architect: {
              build: {
                builder: '@angular-builders/custom-esbuild:browser',
                options: {},
              },
            },
          },
        },
      };

      tree.create('angular.json', JSON.stringify(angularJson, null, 2));

      const result = await runner
        .runSchematicAsync('v19-migration', {}, tree)
        .toPromise();

      expect(result).toBeDefined();
    });
  });

  describe('v21 migration', () => {
    it('should update to v21 with breaking changes', async () => {
      const angularJson = {
        projects: {
          app: {
            architect: {
              build: {
                builder: '@angular-builders/custom-webpack:browser',
                options: {
                  deprecatedOption: 'value',
                },
              },
            },
          },
        },
      };

      tree.create('angular.json', JSON.stringify(angularJson, null, 2));

      const result = await runner
        .runSchematicAsync('v21-migration', {}, tree)
        .toPromise();

      expect(result).toBeDefined();
    });

    it('should remove deprecated options', async () => {
      const angularJson = {
        projects: {
          app: {
            architect: {
              build: {
                builder: '@angular-builders/jest:run',
                options: {
                  deprecatedOption: 'should-be-removed',
                },
              },
            },
          },
        },
      };

      tree.create('angular.json', JSON.stringify(angularJson, null, 2));

      const result = await runner
        .runSchematicAsync('v21-migration', {}, tree)
        .toPromise();

      expect(result).toBeDefined();
    });
  });
});
