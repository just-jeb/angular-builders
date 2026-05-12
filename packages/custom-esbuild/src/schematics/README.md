# @angular-builders/custom-esbuild Schematics

Automated installation and migration for custom esbuild configurations.

## Installation

```bash
ng add @angular-builders/custom-esbuild
```

## What it does

1. Installs @angular-builders/custom-esbuild
2. Configures esbuild builder in angular.json
3. Sets up build optimization options

## Usage After Installation

```bash
# Build with custom esbuild
ng build

# Build with optimization
ng build --optimization
```

## Configuration

Configure esbuild options in angular.json:

```json
{
  "build": {
    "builder": "@angular-builders/custom-esbuild:browser",
    "options": {
      "customEsbuildConfig": {
        "loader": {
          ".ts": "tsx"
        }
      }
    }
  }
}
```

## See Also

- [@angular-builders/custom-esbuild Documentation](../../README.md)
- [esbuild Configuration Guide](https://esbuild.github.io/api)
