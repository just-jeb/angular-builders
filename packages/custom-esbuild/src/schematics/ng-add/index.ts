import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';
import {
  addBuilderDevDependency,
  getProjectsToTarget,
  setBuilderForTarget,
} from '@angular-builders/common/schematics';

import { Schema } from './schema';

const PACKAGE_NAME = '@angular-builders/custom-esbuild';
const BUILD_BUILDER = '@angular-builders/custom-esbuild:application';
const SERVE_BUILDER = '@angular-builders/custom-esbuild:dev-server';

const ESBUILD_BUILD = '@angular/build:application';
const WEBPACK_BUILDS = [
  '@angular-devkit/build-angular:browser',
  '@angular-builders/custom-webpack:browser',
];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const VERSION: string = require('../../../package.json').version;

function classifyBuildBuilder(builder: string | undefined): 'esbuild' | 'webpack' | 'none' | 'other' {
  if (!builder) return 'none';
  if (builder === ESBUILD_BUILD || builder === BUILD_BUILDER) return 'esbuild';
  if (WEBPACK_BUILDS.includes(builder)) return 'webpack';
  return 'other';
}

export function ngAdd(options: Schema): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const projects = getProjectsToTarget(workspace, options.project);

    const rules: Rule[] = [
      addBuilderDevDependency(PACKAGE_NAME, `~${VERSION}`, { install: true }),
    ];

    for (const projectName of projects) {
      const project = workspace.projects.get(projectName)!;
      const buildKind = classifyBuildBuilder(project.targets.get('build')?.builder);

      if (buildKind === 'esbuild') {
        if (project.targets.has('build')) {
          rules.push(setBuilderForTarget(projectName, 'build', BUILD_BUILDER));
        }
        if (project.targets.has('serve')) {
          rules.push(setBuilderForTarget(projectName, 'serve', SERVE_BUILDER));
        }
      }
    }

    return chain(rules);
  };
}
