import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

// @schematics/angular's exports map only exposes `.js` files; collection.json
// is not listed so require.resolve('@schematics/angular/collection.json') throws
// in Node 22+ which enforces the exports map. Resolve via package.json instead.
const NG_COLLECTION = path.join(
  path.dirname(require.resolve('@schematics/angular/package.json')),
  'collection.json',
);

export interface WorkspaceProjectSpec {
  name: string;
  root?: string;
}

export interface CreateWorkspaceOptions {
  projects?: WorkspaceProjectSpec[];
  defaultProject?: string;
}

export class SchematicTestHarness {
  readonly runner: SchematicTestRunner;

  constructor(runner?: SchematicTestRunner) {
    this.runner = runner ?? new SchematicTestRunner('schematics', NG_COLLECTION);
  }

  async createWorkspace(opts: CreateWorkspaceOptions = {}): Promise<UnitTestTree> {
    const projects = opts.projects ?? [{ name: 'app' }];

    let tree = await this.runner.runSchematic('workspace', {
      name: 'workspace',
      version: '0.0.0',
      newProjectRoot: 'projects',
    });

    for (const project of projects) {
      tree = await this.runner.runSchematic(
        'application',
        {
          name: project.name,
          // keep fixtures small + deterministic
          routing: false,
          style: 'css',
          skipTests: false,
          standalone: true,
        },
        tree,
      );
    }

    return tree;
  }
}
