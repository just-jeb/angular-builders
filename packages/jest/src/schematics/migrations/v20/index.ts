import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

/**
 * v19 → v20 migration.
 *
 * No breaking changes in v20 that require automated migration. The zone.js
 * setup introduced in v19 remains unchanged. Global mocks are the same as v19
 * (4 mocks: styleTransform, getComputedStyle, doctype, matchMedia).
 *
 * This migration is a no-op; it exists so ng-update has a complete migration
 * chain from v17 through to v21.
 */
export default function migrate(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info(
      '[v20 migration] No breaking changes in @angular-builders/jest v20. Nothing to migrate.'
    );
  };
}
