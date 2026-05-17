import { JsonObject, JsonValue } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { NgAddOptions } from './schema';

const BUILDER_NAME = '@angular-builders/jest:run';
const KARMA_BUILDER_NAME = '@angular-devkit/build-angular:karma';
const PACKAGE_NAME = '@angular-builders/jest';

const KARMA_DEPS = [
  'karma',
  'karma-chrome-launcher',
  'karma-coverage',
  'karma-jasmine',
  'karma-jasmine-html-reporter',
  'jasmine-core',
  '@types/jasmine',
];

const FILES_TO_REMOVE = ['karma.conf.js', 'src/test.ts'];

interface JsonRecord {
  [key: string]: JsonValue;
}

function readJson(tree: Tree, path: string): JsonRecord {
  const buffer = tree.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not read ${path}`);
  }
  try {
    return JSON.parse(buffer.toString('utf-8')) as JsonRecord;
  } catch (err) {
    throw new SchematicsException(`Could not parse ${path}: ${(err as Error).message}`);
  }
}

function writeJson(tree: Tree, path: string, value: JsonRecord): void {
  tree.overwrite(path, JSON.stringify(value, null, 2) + '\n');
}

function getOwnVersion(): string {
  // Resolves at runtime to dist/schematics/ng-add/index.js, so package.json is
  // three levels up (dist/schematics/ng-add -> dist/schematics -> dist -> pkg root).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('../../../package.json') as { version: string };
  return pkg.version;
}

function updateAngularJson(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const angularJsonPath = tree.exists('angular.json')
      ? 'angular.json'
      : tree.exists('.angular.json')
        ? '.angular.json'
        : null;

    if (!angularJsonPath) {
      throw new SchematicsException('Could not find angular.json in workspace root.');
    }

    const workspace = readJson(tree, angularJsonPath);
    const projects = (workspace.projects ?? {}) as JsonRecord;
    const projectNames = Object.keys(projects);

    if (projectNames.length === 0) {
      throw new SchematicsException('No projects found in angular.json.');
    }

    let projectName = options.project;
    if (!projectName) {
      projectName =
        typeof workspace.defaultProject === 'string' ? workspace.defaultProject : projectNames[0];
    }

    const project = projects[projectName] as JsonRecord | undefined;
    if (!project) {
      throw new SchematicsException(`Project "${projectName}" not found in angular.json.`);
    }

    const architect = (project.architect ?? project.targets) as JsonRecord | undefined;
    if (!architect) {
      throw new SchematicsException(
        `Project "${projectName}" has no architect/targets configuration.`
      );
    }

    const existingTest = architect.test as JsonObject | undefined;
    architect.test = {
      builder: BUILDER_NAME,
      options:
        existingTest && existingTest.builder === KARMA_BUILDER_NAME
          ? {}
          : (existingTest?.options ?? {}),
    };

    writeJson(tree, angularJsonPath, workspace);
    context.logger.info(`Updated angular.json: ${projectName}.architect.test -> ${BUILDER_NAME}`);
    return tree;
  };
}

function updatePackageJson(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pkg = readJson(tree, 'package.json');
    const devDeps = ((pkg.devDependencies ?? {}) as JsonRecord) ?? {};

    let removed = 0;
    for (const dep of KARMA_DEPS) {
      if (dep in devDeps) {
        delete devDeps[dep];
        removed++;
      }
    }
    if (removed > 0) {
      context.logger.info(`Removed ${removed} karma/jasmine dev dependencies.`);
    }

    devDeps[PACKAGE_NAME] = `^${getOwnVersion()}`;
    pkg.devDependencies = devDeps;

    writeJson(tree, 'package.json', pkg);
    context.logger.info(`Added ${PACKAGE_NAME} to devDependencies.`);
    return tree;
  };
}

function removeKarmaFiles(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    for (const path of FILES_TO_REMOVE) {
      if (tree.exists(path)) {
        tree.delete(path);
        context.logger.info(`Deleted ${path}`);
      }
    }
    return tree;
  };
}

function updateTsConfigSpec(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const candidates = ['tsconfig.spec.json', 'src/tsconfig.spec.json'];
    for (const path of candidates) {
      if (!tree.exists(path)) continue;
      const buffer = tree.read(path);
      if (!buffer) continue;

      let raw = buffer.toString('utf-8');
      // Best-effort textual swap so JSONC comments survive.
      const before = raw;
      raw = raw.replace(/"jasmine"/g, '"jest"');
      // Drop a `"files": [...]` block referencing test.ts.
      raw = raw.replace(/,?\s*"files"\s*:\s*\[\s*"src\/test\.ts"\s*\]\s*,?/g, '');
      if (raw !== before) {
        tree.overwrite(path, raw);
        context.logger.info(`Updated ${path}: jasmine -> jest types`);
      }
    }
    return tree;
  };
}

function scheduleInstall(options: NgAddOptions): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    if (options.skipInstall) {
      return;
    }
    context.addTask(new NodePackageInstallTask());
    context.logger.info('Scheduled package install task.');
  };
}

// TODO: test scaffold - add a Jest spec using `SchematicTestRunner` to verify:
//   1. angular.json `architect.test.builder` is rewritten to `@angular-builders/jest:run`
//   2. karma/jasmine devDependencies are removed and @angular-builders/jest is added
//   3. karma.conf.js and src/test.ts are deleted when present
//   4. tsconfig.spec.json `types` swap to `['jest']` and `files` entry removed
//   5. NodePackageInstallTask is scheduled (and skipped when skipInstall=true)
// Blocker for v1: `@angular-devkit/schematics/testing` transitively imports `ora@9`
// (ESM-only). The repo's ts-jest config rejects it with "Cannot use import statement
// outside a module". Follow-up PR: extend `transformIgnorePatterns` and/or
// `moduleNameMapper` to enable schematic specs in this jest config.

export default function ngAdd(options: NgAddOptions = {}): Rule {
  return chain([
    updateAngularJson(options),
    updatePackageJson(),
    removeKarmaFiles(),
    updateTsConfigSpec(),
    scheduleInstall(options),
  ]);
}
