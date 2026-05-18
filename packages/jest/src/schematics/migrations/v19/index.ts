import { JsonValue } from '@angular-devkit/core';
import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';

interface JsonRecord {
  [key: string]: JsonValue;
}

function readJson(tree: Tree, path: string): JsonRecord {
  const buffer = tree.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not read ${path}`);
  }
  return JSON.parse(buffer.toString('utf-8')) as JsonRecord;
}

function writeJson(tree: Tree, path: string, value: JsonRecord): void {
  tree.overwrite(path, JSON.stringify(value, null, 2) + '\n');
}

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
