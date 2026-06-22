import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { workspaces } from '@angular-devkit/core';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { readWorkspace } from '@schematics/angular/utility';
import {
  addBuilderDevDependency,
  detectTestBuilder,
  editJsonFile,
  getProjectsToTarget,
  isZoneless,
  removeDevDependencies,
  removeFilesIfPresent,
  setBuilderForTarget,
} from '@angular-builders/common/schematics';
import { NgAddOptions } from './schema';

const JEST_BUILDER = '@angular-builders/jest:run';

// jest-preset-angular is intentionally NOT listed here: it is a direct dependency of
// @angular-builders/jest, so under a hoisting installer (Yarn node-modules linker, default
// npm) it resolves transitively from the builder and the bare `preset: 'jest-preset-angular'`
// specifier works without the consuming project declaring it. Pinning it here only created a
// second, independently-versioned copy that drifted from the builder's own dependency.
const JEST_STACK: Array<[name: string, version: string]> = [
  ['@angular-builders/jest', '^22.0.0'],
  ['jest', '^30.0.0'],
  ['jest-environment-jsdom', '^30.0.0'],
];

const KARMA_DEVDEPS = [
  'karma',
  'karma-chrome-launcher',
  'karma-coverage',
  'karma-jasmine',
  'karma-jasmine-html-reporter',
  'jasmine',
  'jasmine-core',
  '@types/jasmine',
];

const KARMA_FILES = ['karma.conf.js', 'src/test.ts'];

function hasKarma(tree: Tree, workspace: Awaited<ReturnType<typeof readWorkspace>>): boolean {
  for (const name of workspace.projects.keys()) {
    if (detectTestBuilder(workspace as unknown as workspaces.WorkspaceDefinition, name) === 'karma')
      return true;
  }
  if (tree.exists('/karma.conf.js') || tree.exists('/karma.conf.ts')) return true;
  if (tree.exists('/package.json')) {
    const pkg = JSON.parse(tree.readText('/package.json'));
    const dev = pkg.devDependencies ?? {};
    if (dev['karma'] || dev['jasmine'] || dev['jasmine-core']) return true;
  }
  return false;
}

function hasVitest(workspace: Awaited<ReturnType<typeof readWorkspace>>): boolean {
  for (const name of workspace.projects.keys()) {
    if (
      detectTestBuilder(workspace as unknown as workspaces.WorkspaceDefinition, name) === 'vitest'
    )
      return true;
  }
  return false;
}

const NON_JEST_SPEC_TYPES = ['jasmine', 'vitest', 'vitest/globals'];

function fixSpecTsconfig(path: string): Rule {
  return editJsonFile(path, (json: JSONFile) => {
    const types = json.get(['compilerOptions', 'types']);
    if (Array.isArray(types)) {
      const next = types.filter(t => !NON_JEST_SPEC_TYPES.includes(t as string));
      if (!next.includes('jest')) next.push('jest');
      json.modify(['compilerOptions', 'types'], next);
    }
    const files = json.get(['files']);
    if (Array.isArray(files)) {
      json.modify(
        ['files'],
        files.filter(f => f !== 'src/test.ts' && f !== 'test.ts')
      );
    }
  });
}

export function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const projects = getProjectsToTarget(
      workspace as unknown as workspaces.WorkspaceDefinition,
      options.project
    );

    const rules: Rule[] = [];

    const existingPkg = tree.exists('/package.json')
      ? JSON.parse(tree.readText('/package.json'))
      : {};
    const existingDev: Record<string, string> = existingPkg.devDependencies ?? {};
    const toAdd = JEST_STACK.filter(([name]) => !existingDev[name]);
    toAdd.forEach(([name, version], i) => {
      rules.push(addBuilderDevDependency(name, version, { install: i === toAdd.length - 1 }));
    });

    for (const projectName of projects) {
      const zoneless = isZoneless(
        tree,
        workspace as unknown as workspaces.WorkspaceDefinition,
        projectName
      );
      // replaceOptions: the previous test target may be a :unit-test (Karma/Vitest) or :karma
      // builder whose options (runner, buildTarget, karmaConfig, ...) are meaningless to — and
      // would be forwarded as bogus CLI args by — the Jest builder. Start from a clean jest config.
      rules.push(
        setBuilderForTarget(
          projectName,
          'test',
          JEST_BUILDER,
          { zoneless },
          { replaceOptions: true }
        )
      );
    }

    if (hasKarma(tree, workspace)) {
      rules.push(removeDevDependencies(KARMA_DEVDEPS));
      rules.push(removeFilesIfPresent(KARMA_FILES.map(f => `/${f}`)));
      const specPaths = new Set<string>(['/tsconfig.spec.json']);
      for (const projectName of projects) {
        const root = workspace.projects.get(projectName)?.root ?? '';
        specPaths.add(root ? `/${root}/tsconfig.spec.json` : '/tsconfig.spec.json');
      }
      for (const specPath of specPaths) {
        rules.push(fixSpecTsconfig(specPath));
      }
    }

    if (hasVitest(workspace)) {
      context.logger.warn(
        '[@angular-builders/jest] Detected Vitest as the current test runner. The `test` target ' +
          'was switched to @angular-builders/jest:run, but spec code using `vi.*` (e.g. vi.fn, ' +
          "vi.mock, vi.spyOn) or `import ... from 'vitest'` is NOT rewritten — port it to the " +
          'Jest API (jest.fn, jest.mock, jest.spyOn) manually. Cleanup is lighter than Karma: ' +
          'Vitest is built into @angular/build, so there is no karma.conf-style file to remove.'
      );
      const specPaths = new Set<string>(['/tsconfig.spec.json']);
      for (const projectName of projects) {
        const root = workspace.projects.get(projectName)?.root ?? '';
        specPaths.add(root ? `/${root}/tsconfig.spec.json` : '/tsconfig.spec.json');
      }
      for (const specPath of specPaths) {
        rules.push(fixSpecTsconfig(specPath));
      }
    }

    return chain(rules);
  };
}
