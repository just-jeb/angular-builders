import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { readWorkspace } from '@schematics/angular/utility';

export function migrateV22(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.warn(
      '[@angular-builders/jest] v22: ts-jest `isolatedModules` now defaults to true. ' +
        '`const enum` used across files and type-only re-exports without the `type` modifier ' +
        'will now error. Fix the call sites, or restore `isolatedModules: false` in your jest ' +
        'config. We do not change this automatically — the new default is intentional. ' +
        'See MIGRATION.MD (v21→v22) and #2191.'
    );

    context.logger.warn(
      '[@angular-builders/jest] v22: a TypeScript jest config (e.g. `jest.config.ts`) is now ' +
        'loaded via jiti instead of ts-node. `ts-node` is no longer required just to read the ' +
        'config, and the config is no longer type-checked when loaded. No action needed unless ' +
        'you relied on that load-time type check.'
    );

    const constEnumHits: string[] = [];
    tree.visit(path => {
      if (!path.endsWith('.ts')) return;
      if (path.includes('/node_modules/') || path.includes('/dist/')) return;
      const content = tree.readText(path);
      if (/\bconst\s+enum\b/.test(content)) constEnumHits.push(path);
    });
    if (constEnumHits.length > 0) {
      context.logger.warn(
        '[@angular-builders/jest] Found `const enum` in: ' +
          constEnumHits.join(', ') +
          ' — these may break under isolatedModules. Convert to a regular `enum` or `as const`.'
      );
    }

    const workspace = await readWorkspace(tree);
    const affected = [...workspace.projects.entries()]
      .filter(([, project]) => (project.root ?? '') !== '')
      .map(([name]) => name);
    if (affected.length > 0) {
      context.logger.warn(
        '[@angular-builders/jest] v22: per-project coverage output now writes to ' +
          '<projectRoot>/coverage instead of ./coverage for projects: ' +
          affected.join(', ') +
          '. Update any CI/tooling that reads a hardcoded `./coverage/` path. See #2212.'
      );
    }

    return tree;
  };
}
