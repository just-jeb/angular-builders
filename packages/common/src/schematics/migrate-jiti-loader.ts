import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { JsonValue, workspaces } from '@angular-devkit/core';
import { readWorkspace } from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { removeDevDependencies } from './rules';

/**
 * Shared `ng update` migration for the move from ts-node to jiti as the loader for
 * user-provided TypeScript modules (configs, plugins, transformers).
 *
 * It performs the changes that are safe to automate and advises on the rest:
 *  - strips the `NODE_OPTIONS='--loader ts-node/esm'` / `TS_NODE_PROJECT=…` workaround
 *    from npm scripts (these now fail because ts-node is no longer installed, and are
 *    unnecessary — jiti loads `.ts` configs in ESM projects directly);
 *  - removes `ts-node` / `tsconfig-paths` from devDependencies;
 *  - lifts `paths`/`baseUrl` from a now-ignored `ts-node` tsconfig section into the
 *    standard `compilerOptions` (jiti reads them from there), skipping colliding keys;
 *  - advises (without changing files) on anything that cannot be migrated safely:
 *    non-path overrides in a `ts-node` section, and the loss of build-time type-checking.
 *
 * @param packageName The builder package name, used only as a log prefix.
 */
export function migrateToJitiLoader(packageName: string): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await readWorkspace(tree);
    const tsconfigPaths = collectTsconfigPaths(workspace);

    return chain([
      stripTsNodeEsmFromScripts(packageName),
      removeDevDependencies(['ts-node', 'tsconfig-paths']),
      migrateTsNodeTsconfigSections(packageName, tsconfigPaths),
      adviseTypeChecking(packageName),
    ]);
  };
}

function collectTsconfigPaths(workspace: workspaces.WorkspaceDefinition): string[] {
  const paths = new Set<string>(['/tsconfig.json', '/tsconfig.base.json']);
  for (const project of workspace.projects.values()) {
    for (const target of project.targets.values()) {
      const tsConfig = (target.options as Record<string, unknown> | undefined)?.['tsConfig'];
      if (typeof tsConfig === 'string') {
        paths.add('/' + tsConfig.replace(/^\/+/, ''));
      }
    }
  }
  return [...paths];
}

function stripTsNodeEsmFromScripts(packageName: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists('/package.json')) return tree;
    const json = new JSONFile(tree, '/package.json');
    const scripts = json.get(['scripts']) as Record<string, JsonValue> | undefined;
    if (!scripts) return tree;

    let changed = false;
    for (const [name, value] of Object.entries(scripts)) {
      if (typeof value !== 'string') continue;
      const next = value
        .replace(/\bTS_NODE_PROJECT=\S+\s+/g, '')
        .replace(
          /\bNODE_OPTIONS=(?:'--loader ts-node\/esm'|"--loader ts-node\/esm"|--loader[= ]ts-node\/esm)\s+/g,
          ''
        )
        // A `cross-env` that is now left immediately before the `ng` command is redundant.
        .replace(/^cross-env\s+(?=ng\b)/, '')
        .trim();
      if (next !== value) {
        json.modify(['scripts', name], next);
        changed = true;
      }
    }

    if (changed) {
      context.logger.info(
        `[${packageName}] Removed the \`ts-node/esm\` NODE_OPTIONS loader workaround from npm ` +
          `scripts — TypeScript configs now load via jiti with plain \`ng\` commands.`
      );
    }
    return tree;
  };
}

function migrateTsNodeTsconfigSections(packageName: string, tsconfigPaths: string[]): Rule {
  return (tree: Tree, context: SchematicContext) => {
    for (const path of tsconfigPaths) {
      if (!tree.exists(path)) continue;
      const json = new JSONFile(tree, path);
      const section = json.get(['ts-node']) as
        | { compilerOptions?: Record<string, JsonValue> }
        | undefined;
      const tsNodeCompilerOptions = section?.compilerOptions;
      if (!tsNodeCompilerOptions) continue;

      const { paths, baseUrl, ...rest } = tsNodeCompilerOptions;

      // jiti reads `paths`/`baseUrl` from the standard compilerOptions, so lift them there.
      if (paths && typeof paths === 'object') {
        const existing =
          (json.get(['compilerOptions', 'paths']) as Record<string, JsonValue>) ?? {};
        const merged = { ...existing };
        let addedAlias = false;
        for (const [alias, target] of Object.entries(paths as Record<string, JsonValue>)) {
          if (!(alias in existing)) {
            merged[alias] = target;
            addedAlias = true;
          }
        }
        if (addedAlias) {
          ensureCompilerOptions(json);
          json.modify(['compilerOptions', 'paths'], merged);
        }
      }
      if (typeof baseUrl === 'string' && json.get(['compilerOptions', 'baseUrl']) === undefined) {
        ensureCompilerOptions(json);
        json.modify(['compilerOptions', 'baseUrl'], baseUrl);
      }

      const leftover = Object.keys(rest);
      if (leftover.length > 0) {
        // Non-path overrides (target, module, lib, …) cannot be lifted into the main
        // compilerOptions without also changing the app compile, so leave the section
        // in place and tell the user how to relocate it.
        context.logger.warn(
          `[${packageName}] ${path}: the \`ts-node\` section is no longer read by the builder ` +
            `(loading uses jiti). Its path options were moved to \`compilerOptions\`, but these ` +
            `overrides were left untouched and now have no effect: ${leftover.join(', ')}. ` +
            `If your config files need them, move them into a dedicated tsconfig used only for ` +
            `\`tsc --noEmit\` (see the package README).`
        );
      } else {
        // Fully migrated — drop the now-empty/path-only section.
        json.remove(['ts-node']);
        context.logger.info(
          `[${packageName}] ${path}: migrated the \`ts-node\` section's path options into ` +
            `\`compilerOptions\` and removed the obsolete section.`
        );
      }
    }
    return tree;
  };
}

function ensureCompilerOptions(json: JSONFile): void {
  if (json.get(['compilerOptions']) === undefined) {
    json.modify(['compilerOptions'], {});
  }
}

function adviseTypeChecking(packageName: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.warn(
      `[${packageName}] TypeScript configs/plugins are now transpiled by jiti and are NO LONGER ` +
        `type-checked at build time (your editor still type-checks them). To enforce type-checking ` +
        `in CI, add a dedicated tsconfig that \`include\`s your config files and run ` +
        `\`tsc --noEmit -p tsconfig.build-config.json\`. See the package README.`
    );
    return tree;
  };
}
