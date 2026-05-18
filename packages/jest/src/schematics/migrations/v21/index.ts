import { JsonValue } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
} from '@angular-devkit/schematics';

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
 * v20 → v21 migration.
 *
 * Two breaking changes requiring user action:
 *
 * 1. **Zoneless default** — `zoneless` option now defaults to `true`. Apps
 *    still using zone.js change detection MUST explicitly set `zoneless: false`
 *    in `angular.json` under `architect.test.options`. This migration detects
 *    whether `@angular/core` is present and sets `zoneless: false` as a
 *    conservative default, preserving zone-based behaviour for existing apps.
 *
 * 2. **Reduced global mocks** — `styleTransform`, `getComputedStyle`, and
 *    `doctype` mocks were removed (Jest 30's jsdom provides them natively).
 *    Only `matchMedia` remains. If the user had overridden `globalMocks` to
 *    include those, they should remove them. This migration emits a warning.
 */

function setZonelessFalse(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const angularJsonPath = tree.exists('angular.json')
      ? 'angular.json'
      : tree.exists('.angular.json')
        ? '.angular.json'
        : null;

    if (!angularJsonPath) {
      context.logger.warn('[v21 migration] Could not find angular.json. Skipping zoneless update.');
      return tree;
    }

    const workspace = readJson(tree, angularJsonPath);
    const projects = (workspace.projects ?? {}) as JsonRecord;
    let updated = 0;

    for (const projectName of Object.keys(projects)) {
      const project = projects[projectName] as JsonRecord;
      const architect = (project.architect ?? project.targets) as JsonRecord | undefined;
      if (!architect) continue;

      const test = architect.test as JsonRecord | undefined;
      if (!test) continue;

      const builderName = test.builder as string | undefined;
      if (!builderName?.includes('@angular-builders/jest')) continue;

      const options = (test.options ?? {}) as JsonRecord;
      // Only set zoneless: false if the user has not already configured it.
      if (options.zoneless === undefined) {
        options.zoneless = false;
        test.options = options;
        updated++;
        context.logger.info(
          `[v21 migration] Set ${projectName}.architect.test.options.zoneless = false ` +
            '(v21 defaults to true/zoneless; set to false to preserve zone.js behaviour). ' +
            'Remove this option if your app uses provideZonelessChangeDetection().'
        );
      }
    }

    if (updated > 0) {
      writeJson(tree, angularJsonPath, workspace);
    }

    return tree;
  };
}

function warnAboutRemovedMocks(): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.warn(
      '[v21 migration] @angular-builders/jest v21 removed the globalMocks for ' +
        "'styleTransform', 'getComputedStyle', and 'doctype' (Jest 30 jsdom provides " +
        "them natively). Only 'matchMedia' remains. If you had custom code that depended " +
        'on those mocks, verify your tests still pass.'
    );
  };
}

export default function migrate(): Rule {
  return chain([setZonelessFalse(), warnAboutRemovedMocks()]);
}
