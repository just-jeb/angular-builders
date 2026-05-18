import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';

// Points at the compiled schematics collection (already built in dist/).
// Using dist avoids ts-jest factory-resolution issues with the SchematicTestRunner.
const collectionPath = path.join(__dirname, '../../../dist/schematics/collection.json');

const DEFAULT_ANGULAR_JSON = {
  version: 1,
  projects: {
    'my-app': {
      projectType: 'application',
      architect: {
        test: {
          builder: '@angular-devkit/build-angular:karma',
          options: {
            karmaConfig: 'karma.conf.js',
          },
        },
      },
    },
  },
};

const DEFAULT_PACKAGE_JSON = {
  name: 'my-app',
  version: '1.0.0',
  devDependencies: {
    karma: '^6.0.0',
    'karma-chrome-launcher': '^3.0.0',
    'karma-coverage': '^2.0.0',
    'karma-jasmine': '^5.0.0',
    'karma-jasmine-html-reporter': '^2.0.0',
    'jasmine-core': '^4.0.0',
    '@types/jasmine': '^4.0.0',
  },
};

const DEFAULT_TSCONFIG_SPEC = `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "files": [
    "src/test.ts"
  ],
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
`;

describe('@angular-builders/jest ng-add schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('ng-add', collectionPath);
  });

  function buildBaseTree(): UnitTestTree {
    const tree = new UnitTestTree(new HostTree());
    tree.create('angular.json', JSON.stringify(DEFAULT_ANGULAR_JSON, null, 2));
    tree.create('package.json', JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2));
    return tree;
  }

  // 1. angular.json architect.test.builder is rewritten to @angular-builders/jest:run
  it('rewrites angular.json architect.test.builder to @angular-builders/jest:run', async () => {
    const tree = buildBaseTree();
    const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);

    const angularJson = JSON.parse(result.read('angular.json')!.toString('utf-8'));
    expect(angularJson.projects['my-app'].architect.test.builder).toBe(
      '@angular-builders/jest:run'
    );
  });

  // 2. karma/jasmine devDependencies are removed and @angular-builders/jest is added
  it('removes karma/jasmine devDependencies and adds @angular-builders/jest', async () => {
    const tree = buildBaseTree();
    const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);

    const pkgJson = JSON.parse(result.read('package.json')!.toString('utf-8'));
    const devDeps = pkgJson.devDependencies as Record<string, string>;

    // Karma/jasmine packages must be gone
    for (const dep of [
      'karma',
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-jasmine',
      'karma-jasmine-html-reporter',
      'jasmine-core',
      '@types/jasmine',
    ]) {
      expect(devDeps).not.toHaveProperty(dep);
    }

    // @angular-builders/jest must be present with a semver range
    expect(devDeps['@angular-builders/jest']).toBeDefined();
    expect(devDeps['@angular-builders/jest']).toMatch(/^\^/);
  });

  // 3. karma.conf.js and src/test.ts are deleted when present
  it('deletes karma.conf.js and src/test.ts when present', async () => {
    const tree = buildBaseTree();
    tree.create('karma.conf.js', '// karma config');
    tree.create('src/test.ts', '// karma test entry');

    const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);

    expect(result.exists('karma.conf.js')).toBe(false);
    expect(result.exists('src/test.ts')).toBe(false);
  });

  // 4. tsconfig.spec.json types swap to ['jest'] and files entry removed
  it('updates tsconfig.spec.json: replaces jasmine type with jest and removes files entry', async () => {
    const tree = buildBaseTree();
    tree.create('tsconfig.spec.json', DEFAULT_TSCONFIG_SPEC);

    const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);

    const raw = result.read('tsconfig.spec.json')!.toString('utf-8');
    expect(raw).toContain('"jest"');
    expect(raw).not.toContain('"jasmine"');
    expect(raw).not.toContain('"src/test.ts"');
  });

  // 5a. NodePackageInstallTask is scheduled by default (skipInstall=false)
  it('schedules NodePackageInstallTask by default', async () => {
    const tree = buildBaseTree();
    await runner.runSchematic('ng-add', {}, tree);

    expect(runner.tasks.length).toBeGreaterThan(0);
    expect(runner.tasks.some(t => t.name === 'node-package')).toBe(true);
  });

  // 5b. NodePackageInstallTask is NOT scheduled when skipInstall=true
  it('does not schedule NodePackageInstallTask when skipInstall=true', async () => {
    const tree = buildBaseTree();
    await runner.runSchematic('ng-add', { skipInstall: true }, tree);

    expect(runner.tasks.every(t => t.name !== 'node-package')).toBe(true);
  });
});
