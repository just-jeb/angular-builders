import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

/**
 * Base test harness for schematic testing using SchematicTestRunner.
 * Provides a standardized way to test ng-add schematics across packages.
 */
export class NgAddSchematicTestHarness {
  private runner: SchematicTestRunner;
  private appTree: UnitTestTree;

  constructor(
    private collectionPath: string,
    private schematicName: string,
    private workspaceFactory?: () => Partial<any>
  ) {
    this.runner = new SchematicTestRunner(
      schematicName,
      collectionPath
    );
    this.appTree = this.createDefaultWorkspaceTree();
  }

  /**
   * Creates a default workspace tree for testing.
   */
  private createDefaultWorkspaceTree(): UnitTestTree {
    const tree = new UnitTestTree(this.runner.empty);
    const workspace = this.workspaceFactory ? this.workspaceFactory() : this.getDefaultWorkspace();
    
    tree.create('/package.json', JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        '@angular/core': '^17.0.0',
        '@angular/cli': '^17.0.0',
      },
      devDependencies: {},
    }, null, 2));

    tree.create('/angular.json', JSON.stringify(workspace, null, 2));

    return tree;
  }

  /**
   * Gets default Angular workspace configuration.
   */
  private getDefaultWorkspace(): Partial<any> {
    return {
      version: 1,
      newProjectRoot: 'projects',
      projects: {
        'test-app': {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:browser',
              options: {},
            },
            test: {
              builder: '@angular-devkit/build-angular:karma',
              options: {},
            },
          },
        },
      },
    };
  }

  /**
   * Gets the test tree (workspace).
   */
  getTree(): UnitTestTree {
    return this.appTree;
  }

  /**
   * Sets the test tree.
   */
  setTree(tree: UnitTestTree): void {
    this.appTree = tree;
  }

  /**
   * Runs the schematic with the given options.
   */
  async runSchematic(options: any = {}): Promise<UnitTestTree> {
    this.appTree = await this.runner
      .runSchematicAsync(this.schematicName, options, this.appTree)
      .toPromise() as UnitTestTree;
    return this.appTree;
  }

  /**
   * Gets file content from the tree.
   */
  getFileContent(path: string): string {
    const buffer = this.appTree.read(path);
    if (!buffer) {
      throw new Error(`File not found: ${path}`);
    }
    return buffer.toString('utf-8');
  }

  /**
   * Gets file content as JSON.
   */
  getJsonFile<T>(path: string): T {
    return JSON.parse(this.getFileContent(path));
  }

  /**
   * Checks if a file exists.
   */
  fileExists(path: string): boolean {
    return this.appTree.exists(path);
  }

  /**
   * Verifies that package.json contains a dependency.
   */
  assertDependencyExists(packageName: string, isDev = true): void {
    const packageJson = this.getJsonFile<any>('/package.json');
    const deps = isDev ? packageJson.devDependencies : packageJson.dependencies;
    
    if (!deps || !deps[packageName]) {
      throw new Error(
        `Expected ${isDev ? 'dev' : ''} dependency "${packageName}" not found in package.json`
      );
    }
  }

  /**
   * Verifies that angular.json has been updated with builder configuration.
   */
  assertBuilderConfigured(
    projectName: string,
    targetName: string,
    builderName: string
  ): void {
    const angularJson = this.getJsonFile<any>('/angular.json');
    const project = angularJson.projects?.[projectName];
    const target = project?.architect?.[targetName];
    const actualBuilder = target?.builder;

    if (actualBuilder !== builderName) {
      throw new Error(
        `Expected builder "${builderName}" for ${projectName}:${targetName}, but got "${actualBuilder}"`
      );
    }
  }
}
