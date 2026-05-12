# @angular-builders/jest Schematics

Automated installation and migration for the Jest builder.

## Installation

```bash
ng add @angular-builders/jest
```

### Options

- `--skipInstall`: Skip npm install
- `--skipConfig`: Skip angular.json configuration

## What it does

The ng-add schematic will:
1. Add @angular-builders/jest to devDependencies
2. Create jest.config.js if needed
3. Add test builder configuration to angular.json

## Usage After Installation

```bash
# Run tests
ng test

# Run tests with coverage
ng test --coverage

# Run specific test file
ng test --include='**/feature.spec.ts'
```

## Configuration

Edit `jest.config.js` to customize Jest behavior:

```javascript
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
};
```

## See Also

- [@angular-builders/jest Documentation](../../README.md)
- [Jest Configuration Guide](https://jestjs.io/docs/configuration)
