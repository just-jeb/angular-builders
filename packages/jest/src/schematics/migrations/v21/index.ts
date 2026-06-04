import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { JsonValue, workspaces } from '@angular-devkit/core';
import { readWorkspace, updateWorkspace } from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { editJsonFile, isZoneless } from '@angular-builders/common/schematics';

const DEP_BUMPS: Record<string, string> = {
  jest: '^30.0.0',
  'jest-environment-jsdom': '^30.0.0',
  jsdom: '^26.0.0',
};

function bumpDeps(): Rule {
  return (tree: Tree) => {
    if (!tree.exists('/package.json')) return tree;
    const json = new JSONFile(tree, '/package.json');
    for (const [name, version] of Object.entries(DEP_BUMPS)) {
      if (json.get(['devDependencies', name]) !== undefined) {
        json.modify(['devDependencies', name], version);
      }
      if (json.get(['dependencies', name]) !== undefined) {
        json.modify(['dependencies', name], version);
      }
    }
    return tree;
  };
}

function patchSpecTsconfig(): Rule {
  return editJsonFile('/tsconfig.spec.json', (json: JSONFile) => {
    json.modify(['compilerOptions', 'module'], 'Node16');
    json.modify(['compilerOptions', 'moduleResolution'], 'Node16');
    json.modify(['compilerOptions', 'isolatedModules'], true);
  });
}

const OPTION_RENAMES: Record<string, string> = {
  configPath: 'config',
  testPathPattern: 'testPathPatterns',
};

function renameBuilderOptions(): Rule {
  return updateWorkspace((workspace) => {
    for (const project of workspace.projects.values()) {
      const test = project.targets.get('test');
      if (!test || test.builder !== '@angular-builders/jest:run') continue;
      const options = (test.options ?? {}) as Record<string, unknown>;
      for (const [from, to] of Object.entries(OPTION_RENAMES)) {
        if (from in options) {
          if (!(to in options)) options[to] = options[from];
          delete options[from];
        }
      }
      // Jest 30 renamed the single-string `testPathPattern` to the array-valued
      // `testPathPatterns`. Wrap a carried-over string value so it matches the schema.
      if (typeof options['testPathPatterns'] === 'string') {
        options['testPathPatterns'] = [options['testPathPatterns']];
      }
      test.options = options as unknown as Record<string, JsonValue>;
    }
  });
}

const REMOVED_GLOBAL_MOCKS = ['styleTransform', 'getComputedStyle', 'doctype'];
const REMOVED_JEST_OPTIONS = ['browser', 'init', 'mapCoverage', 'testURL', 'timers'];

function stripRemovedOptions(): Rule {
  return updateWorkspace((workspace) => {
    for (const project of workspace.projects.values()) {
      const test = project.targets.get('test');
      if (!test || test.builder !== '@angular-builders/jest:run') continue;
      const options = (test.options ?? {}) as Record<string, unknown>;

      if (Array.isArray(options['globalMocks'])) {
        options['globalMocks'] = (options['globalMocks'] as unknown[]).filter(
          (v) => !REMOVED_GLOBAL_MOCKS.includes(v as string),
        );
      }
      for (const removed of REMOVED_JEST_OPTIONS) {
        if (removed in options) delete options[removed];
      }
      test.options = options as unknown as Record<string, JsonValue>;
    }
  });
}

function setZonelessByDetection(): Rule {
  return async (tree: Tree) => {
    const workspace = await readWorkspace(tree);
    return updateWorkspace((ws) => {
      for (const [name, project] of ws.projects) {
        const test = project.targets.get('test');
        if (!test || test.builder !== '@angular-builders/jest:run') continue;
        if (!isZoneless(tree, workspace as unknown as workspaces.WorkspaceDefinition, name)) {
          const options = (test.options ?? {}) as Record<string, unknown>;
          options['zoneless'] = false;
          test.options = options as unknown as Record<string, JsonValue>;
        }
      }
    });
  };
}

export function migrateV21(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.warn(
      '[@angular-builders/jest] v21 migration applied. Note: tsconfig.spec.json now uses ' +
        'module/moduleResolution "Node16", which may surface pre-existing type errors in your ' +
        'spec code — fix the reported type issues.',
    );
    context.logger.warn(
      '[@angular-builders/jest] Removed globalMocks (styleTransform, getComputedStyle, doctype) ' +
        'were stripped from your config; if your tests relied on them, replace them manually. ' +
        'See MIGRATION.MD (v20→v21) for details.',
    );
    return chain([
      bumpDeps(),
      patchSpecTsconfig(),
      renameBuilderOptions(),
      stripRemovedOptions(),
      setZonelessByDetection(),
    ]);
  };
}
