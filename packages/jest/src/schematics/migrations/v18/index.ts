import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

/**
 * v17 → v18 migration.
 *
 * Breaking change: setup file moved from a bare `import 'jest-preset-angular'`
 * to `import 'jest-preset-angular/setup-jest'`. Users who had customised
 * `setupFilesAfterFramework` to reference the old entrypoint need it updated.
 *
 * Angular.json change: none required (builder API unchanged).
 * Custom setup files: if the user's jest config references the old import we
 * emit an info message -- we cannot safely rewrite arbitrary JS/TS files.
 */
export default function migrate(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(
      '[v18 migration] @angular-builders/jest v18 switched the preset setup file ' +
        "from 'jest-preset-angular' to 'jest-preset-angular/setup-jest'.\n" +
        'If you have a custom jest config that references setupFilesAfterEnv with ' +
        "the old import, update it to 'jest-preset-angular/setup-jest'."
    );

    // Check tsconfig.spec.json for lingering jasmine types (common v17 leftover).
    const candidates = ['tsconfig.spec.json', 'src/tsconfig.spec.json'];
    for (const path of candidates) {
      if (!tree.exists(path)) continue;
      const buffer = tree.read(path);
      if (!buffer) continue;

      let raw = buffer.toString('utf-8');
      if (raw.includes('"jasmine"')) {
        raw = raw.replace(/"jasmine"/g, '"jest"');
        tree.overwrite(path, raw);
        context.logger.info(
          `[v18 migration] Updated ${path}: replaced "jasmine" with "jest" in types array.`
        );
      }
    }

    return tree;
  };
}
