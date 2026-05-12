# @angular-builders Schematics

This directory contains the shared schematics for @angular-builders packages, enabling automated installation and migration of custom Angular build tools.

## Overview

The schematics system provides:
- **ng-add**: Automated installation and configuration for each @angular-builders package
- **ng-update**: Automated migration paths for version upgrades (v17 → v18 → v19 → v21)
- **Test Harness**: SchematicTestRunner-based tests using Angular's official testing utilities

## Packages

- `@angular-builders/jest` — Custom Jest builder for Angular projects
- `@angular-builders/custom-webpack` — Webpack customization builder
- `@angular-builders/custom-esbuild` — esbuild customization builder
- `@angular-builders/bazel` — Bazel build tool integration
- `@angular-builders/timestamp` — Build timestamp utilities
- `@angular-builders/dev-server` — Custom dev server implementation

## Installation

### Using ng-add (Recommended)

```bash
ng add @angular-builders/jest
ng add @angular-builders/custom-webpack
ng add @angular-builders/custom-esbuild
```

The `ng-add` schematic will:
1. Install the package to devDependencies
2. Update package.json with builder metadata
3. Configure angular.json with builder references (if applicable)

### Options

Each builder supports schematic options:

**Jest Builder:**
```bash
ng add @angular-builders/jest --skipInstall --skipConfig
```

- `--skipInstall`: Skip npm install after adding package
- `--skipConfig`: Skip automatic angular.json configuration

## Migrations

When upgrading @angular-builders packages, run:

```bash
ng update @angular-builders/jest
ng update @angular-builders/custom-webpack
ng update @angular-builders/custom-esbuild
```

This will automatically run the appropriate migration schematics based on your current version.

### Supported Migration Paths

- **v17 → v18**: Updates for Angular 18 compatibility
- **v18 → v19**: Updates for Angular 19 compatibility
- **v19 → v21**: Major version update with potential breaking changes

### What Migrations Do

Migrations automatically:
1. Update builder references in angular.json
2. Update package.json metadata
3. Remove deprecated configuration options
4. Validate compatibility with your Angular version

## Development

### File Structure

```
packages/common/schematics/
├── collection.json           # Schematic registry
├── migrations.json           # Migration registry
├── ng-add-init.ts           # Shared ng-add initialization
├── file-utils.ts            # File system utilities
├── version-utils.ts         # Version checking utilities
├── test-harness.ts          # Testing infrastructure
└── migrations/
    ├── v18/index.ts         # v18 migration logic
    ├── v19/index.ts         # v19 migration logic
    └── v21/index.ts         # v21 migration logic
```

Each package also has:
```
packages/<name>/src/schematics/
├── collection.json          # Package-specific registry
├── ng-add/                  # ng-add implementation
│   ├── index.ts
│   └── schema.json          # ng-add options schema
└── migrations.json          # Reference to common migrations
```

### Running Tests

```bash
# Run all schematic tests
yarn test --testPathPattern=schematics

# Run specific package tests
yarn test packages/jest/tests/schematics

# Run migration tests
yarn test packages/common/tests/schematics/migrations.spec.ts
```

### Test Structure

Tests use `@angular-devkit/schematics/testing` with `SchematicTestRunner`:

```typescript
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../src/schematics/collection.json');

describe('schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('jest', collectionPath);
  });

  it('should run ng-add', async () => {
    const tree = Tree.empty();
    tree.create('package.json', JSON.stringify({ name: 'app' }, null, 2));
    
    const result = await runner
      .runSchematicAsync('ng-add', {}, tree)
      .toPromise();
    
    expect(result).toBeDefined();
  });
});
```

## Adding a New Builder Package

To add schematics to a new builder package:

1. Create the directory structure:
   ```
   packages/my-builder/src/schematics/
   ├── collection.json
   ├── ng-add/
   │   ├── index.ts
   │   └── schema.json
   └── migrations.json
   ```

2. Implement ng-add in `ng-add/index.ts`:
   ```typescript
   export default function(options: any): Rule {
     return (tree: Tree, context: SchematicContext) => {
       // Implementation
     };
   }
   ```

3. Add metadata to package.json:
   ```json
   {
     "ng-add": {
       "package.json": {
         "devDependencies": {}
       }
     },
     "ng-update": {
       "migrations": "./dist/schematics/migrations.json",
       "packageGroup": ["@angular-builders/my-builder"]
     }
   }
   ```

4. Add tests in `packages/my-builder/tests/schematics/`

## Troubleshooting

### Schematic not found

Ensure your package.json includes the correct `ng-add` metadata and the schematic is listed in collection.json.

### Migration not running

Check that:
1. Your package.json has `ng-update.migrations` pointing to migrations.json
2. Your version in package.json matches a migration version
3. Run with `ng update --verbose` to see migration execution

### Test failures

Verify:
1. SchematicTestRunner is using the correct collectionPath
2. Tree files are created before running schematics
3. Async operations are properly awaited

## Resources

- [Angular Schematics Documentation](https://angular.io/guide/schematics)
- [@angular-devkit/schematics API](https://github.com/angular/angular-cli/tree/master/packages/angular_devkit/schematics)
- [Schematic Testing Guide](https://angular.io/guide/schematics-authoring#testing-a-schematic)

## License

MIT
