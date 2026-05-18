import { JsonValue } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { NgAddOptions } from './schema';

const BUILDER_NAME = '@angular-builders/custom-esbuild:application';
const PACKAGE_NAME = '@angular-builders/custom-esbuild';

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

    const existingBuild = architect.build as JsonRecord | undefined;
    const existingBuilder = existingBuild?.builder as string | undefined;

    architect.build = {
      ...(existingBuild ?? {}),
      builder: BUILDER_NAME,
    };

    writeJson(tree, angularJsonPath, workspace);
    context.logger.info(
      `Updated angular.json: ${projectName}.architect.build.builder ` +
        `${existingBuilder ? `(was: ${existingBuilder}) ` : ''}-> ${BUILDER_NAME}`
    );
    return tree;
  };
}

function updatePackageJson(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pkg = readJson(tree, 'package.json');
    const devDeps = (pkg.devDependencies ?? {}) as JsonRecord;

    devDeps[PACKAGE_NAME] = `^${getOwnVersion()}`;
    pkg.devDependencies = devDeps;

    writeJson(tree, 'package.json', pkg);
    context.logger.info(`Added ${PACKAGE_NAME} to devDependencies.`);
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

export default function ngAdd(options: NgAddOptions = {}): Rule {
  return chain([updateAngularJson(options), updatePackageJson(), scheduleInstall(options)]);
}
