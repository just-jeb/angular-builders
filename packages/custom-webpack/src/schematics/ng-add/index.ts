import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { readWorkspace as getWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { workspaces } from '@angular-devkit/core';
import {
  addBuilderDevDependency,
  getProjectsToTarget,
} from '@angular-builders/common/schematics';
import { NgAddSchema } from './schema';

const PACKAGE_NAME = '@angular-builders/custom-webpack';
const BROWSER_BUILDER = `${PACKAGE_NAME}:browser`;
const DEV_SERVER_BUILDER = `${PACKAGE_NAME}:dev-server`;
const DEFAULT_CONFIG_FILE = 'webpack.config.js';

const SELF_VERSION_RANGE = '^22.0.0';

function webpackConfigFileExists(tree: Tree): boolean {
  return (
    tree.exists(`/${DEFAULT_CONFIG_FILE}`) ||
    tree.exists('/webpack.config.ts') ||
    tree.exists('/webpack.config.cjs') ||
    tree.exists('/webpack.config.mjs')
  );
}

function rewriteTargets(projectName: string): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);
    if (!project) return;
    const build = project.targets.get('build');
    if (build) build.builder = BROWSER_BUILDER;
    const serve = project.targets.get('serve');
    if (serve) serve.builder = DEV_SERVER_BUILDER;
  });
}

function scaffoldConfig(projectName: string): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const project = workspace.projects.get(projectName);
    const buildOptions =
      (project?.targets.get('build')?.options as Record<string, unknown> | undefined) ?? {};

    const alreadyReferenced =
      buildOptions['customWebpackConfig'] !== undefined &&
      buildOptions['customWebpackConfig'] !== false;

    if (alreadyReferenced || webpackConfigFileExists(tree)) {
      context.logger.info('[custom-webpack] A webpack config is already present; leaving it untouched.');
      return noop();
    }

    const templateSource = apply(url('./files'), [applyTemplates({}), move('/')]);

    return chain([
      mergeWith(templateSource),
      updateWorkspace((ws) => {
        const buildTarget = ws.projects.get(projectName)?.targets.get('build');
        if (buildTarget) {
          buildTarget.options = {
            ...(buildTarget.options ?? {}),
            customWebpackConfig: { path: DEFAULT_CONFIG_FILE },
          };
        }
      }),
    ]);
  };
}

export function ngAdd(options: NgAddSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projects = getProjectsToTarget(workspace as unknown as workspaces.WorkspaceDefinition, options.project);

    if (projects.length === 0) {
      context.logger.warn('[custom-webpack] No projects found to configure.');
      return noop();
    }

    const perProject: Rule[] = [];
    for (const projectName of projects) {
      perProject.push(rewriteTargets(projectName));
      perProject.push(scaffoldConfig(projectName));
    }

    return chain([
      addBuilderDevDependency(PACKAGE_NAME, SELF_VERSION_RANGE, { install: true }),
      ...perProject,
    ]);
  };
}
