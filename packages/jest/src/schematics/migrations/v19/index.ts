import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

/**
 * v18 → v19 migration.
 *
 * Breaking change: zone.js setup switched from `jest-preset-angular/setup-jest`
 * (implicit zone support) to an explicit `setupZoneTestEnv()` call from
 * `jest-preset-angular/setup-env/zone`. The builder now injects this
 * automatically via `setupFilesAfterEnv`. No angular.json changes are required
 * unless the user was manually referencing the old setup file.
 *
 * This migration emits guidance and removes any explicit reference to the v18
 * setup file from `angular.json` builder options (the builder handles it now).
 */
export default function migrate(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(
      '[v19 migration] @angular-builders/jest v19 switched zone.js setup to ' +
        "explicit setupZoneTestEnv() from 'jest-preset-angular/setup-env/zone'.\n" +
        'The builder injects this automatically. If you referenced the v18 setup ' +
        "file ('jest-preset-angular/setup-jest') in your own setupFilesAfterEnv, " +
        'remove it to avoid duplicate setup.'
    );

    return tree;
  };
}
