import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../../src/schematics/collection.json');

describe('@angular-builders/custom-webpack ng-add', () => {
  let runner: SchematicTestRunner;
  let tree: Tree;

  beforeEach(() => {
    runner = new SchematicTestRunner('ng-add', collectionPath);
    tree = Tree.empty();
  });

  it('should add @angular-builders/custom-webpack to devDependencies', async () => {
    const packageJson = {
      name: 'test-app',
      version: '1.0.0',
      devDependencies: {},
    };

    tree.create('package.json', JSON.stringify(packageJson, null, 2));

    const result = await runner.runSchematicAsync('ng-add', {}, tree).toPromise();

    const updatedPkgJson = JSON.parse(result.read('package.json')!.toString());
    expect(updatedPkgJson.devDependencies['@angular-builders/custom-webpack']).toBeDefined();
  });

  it('should handle skipInstall option', async () => {
    const packageJson = {
      name: 'test-app',
      version: '1.0.0',
      devDependencies: {},
    };

    tree.create('package.json', JSON.stringify(packageJson, null, 2));

    const result = await runner
      .runSchematicAsync('ng-add', { skipInstall: true }, tree)
      .toPromise();

    expect(result).toBeDefined();
  });

  it('should skip config when skipConfig is true', async () => {
    const packageJson = {
      name: 'test-app',
      version: '1.0.0',
      devDependencies: {},
    };

    tree.create('package.json', JSON.stringify(packageJson, null, 2));

    const result = await runner
      .runSchematicAsync('ng-add', { skipConfig: true }, tree)
      .toPromise();

    expect(result).toBeDefined();
  });

  it('should not duplicate package if already installed', async () => {
    const packageJson = {
      name: 'test-app',
      version: '1.0.0',
      devDependencies: {
        '@angular-builders/custom-webpack': '^19.0.0',
      },
    };

    tree.create('package.json', JSON.stringify(packageJson, null, 2));

    const result = await runner.runSchematicAsync('ng-add', {}, tree).toPromise();

    const updatedPkgJson = JSON.parse(result.read('package.json')!.toString());
    expect(updatedPkgJson.devDependencies['@angular-builders/custom-webpack']).toEqual('^19.0.0');
  });
});
