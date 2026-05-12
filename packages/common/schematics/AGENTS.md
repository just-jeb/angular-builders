# Schematics — Shared Foundation

> Shared Angular schematics framework for all `@angular-builders/*` packages. Provides ng-add initialization and common utilities for builder setup.

## Purpose

Angular schematics automate installation and setup of `@angular-builders/*` packages. The ng-add schematic (`ng add @angular-builders/jest`, etc.) should:
1. Add the package to `devDependencies` in `package.json`
2. Update `angular.json` to configure the builder for one or more projects
3. Provide setup guidance to the developer

This directory provides shared utilities and a base factory to avoid duplication across packages.

## Structure

```
schematics/
├── AGENTS.md                    # This file
├── collection.json              # Schematic collection metadata
├── ng-add-init.ts              # Base factory for ng-add schematics
├── file-utils.ts               # Workspace tree file operations
├── version-utils.ts            # Version parsing and comparison
├── test-harness.ts             # TestRunner harness for unit testing schematics
```

## Key Exports

### `createNgAddRule(builderPackageName, builderVersion, options)`
Factory function for creating a standard ng-add schematic. Usage:

```ts
// In packages/jest/src/schematics/ng-add/index.ts
import { createNgAddRule } from '@angular-builders/common/schematics';

const rule = createNgAddRule('@angular-builders/jest', '21.0.0', {
  skipPackageJson: false,
});

export default rule;
```

### File Utilities
- `readJsonFile<T>(tree, path): T` — Read and parse JSON
- `writeJsonFile<T>(tree, path, data): void` — Write JSON
- `readTextFile(tree, path): string` — Read text
- `writeTextFile(tree, path, content): void` — Write text
- `fileExists(tree, path): boolean` — Check existence

### Version Utilities
- `parseVersion(versionString): VersionInfo` — Parse semantic version
- `formatVersion(info): string` — Format back to string
- `isVersionGreaterOrEqual(version, minimum): boolean` — Version comparison
- `getMajorVersion(packageName, versionString): number` — Extract major version

### Test Harness
`NgAddSchematicTestHarness` — Standardized testing for schematics:

```ts
const harness = new NgAddSchematicTestHarness(
  path.join(__dirname, '../collection.json'),
  'ng-add'
);
await harness.runSchematic({ /* options */ });
harness.assertDependencyExists('@angular-builders/jest');
```

## Per-Package Integration

Each builder package (`jest`, `custom-webpack`, `custom-esbuild`) adds its own schematics:

```
packages/jest/src/schematics/
├── collection.json
├── ng-add/
│   ├── index.ts          # Package-specific ng-add rule
│   └── schema.json       # Options schema
└── ng-update/            # (Future: version migrations)
    └── index.ts
```

The package-specific `ng-add/index.ts` imports the base factory and customizes it:

```ts
import { createNgAddRule } from '@angular-builders/common/schematics';
import { readJsonFile, writeJsonFile } from '@angular-builders/common/schematics';

export default (options: any) => {
  return (tree, context) => {
    // Base rule setup
    const baseRule = createNgAddRule('@angular-builders/jest', '21.0.0', options);
    
    // Custom logic: update angular.json to configure jest builder
    const customRule = (tree, context) => {
      const angularJson = readJsonFile<any>(tree, '/angular.json');
      // Update projects...
      writeJsonFile(tree, '/angular.json', angularJson);
    };

    return chain([baseRule, customRule])(tree, context);
  };
};
```

## Testing Schematics

Each package includes schematic tests in `packages/<name>/tests/schematics/`:

```ts
import { NgAddSchematicTestHarness } from '@angular-builders/common/schematics';

describe('Jest ng-add', () => {
  it('should add @angular-builders/jest to devDependencies', async () => {
    const harness = new NgAddSchematicTestHarness(
      path.join(__dirname, '../../src/schematics/collection.json'),
      'ng-add'
    );
    
    await harness.runSchematic();
    harness.assertDependencyExists('@angular-builders/jest');
  });
});
```

## Targets

**Target Angular versions:** v17+ (per Jeb's decision: "Target v21+")
**Target Node versions:** 18+
**Schematic framework:** @angular-devkit/schematics

## Invariants

**MUST:** All per-package ng-add schematics use the `createNgAddRule` base factory from this directory.

**MUST:** The base factory handles package.json updates; per-package rules add custom logic on top (e.g., updating angular.json project config).

**MUST:** All schematics are tested with `NgAddSchematicTestHarness` using SchematicTestRunner, not just unit tests.

**MUST NEVER:** Duplicate file I/O or version-parsing logic across packages. Reuse utilities from this directory.

## Next Steps (Phase 2+)

- Phase 2: Per-package ng-add schematics (jest, custom-webpack, custom-esbuild)
- Phase 3: Migration schematics (ng-update) for version upgrades
- Phase 4: Update package.json "ng-add" and "ng-update" metadata
- Phase 5: Integration tests with full Angular harness
- Phase 6: Documentation for users (READMEs)
