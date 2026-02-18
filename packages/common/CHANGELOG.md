# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.4-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@5.0.4-beta.0...@angular-builders/common@5.0.4-beta.1) (2026-02-18)

**Note:** Version bump only for package @angular-builders/common

## [5.0.4-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@5.0.3...@angular-builders/common@5.0.4-beta.0) (2026-02-16)

**Note:** Version bump only for package @angular-builders/common

## <small>5.0.3 (2026-01-14)</small>

**Note:** Version bump only for package @angular-builders/common

## <small>5.0.3-beta.1 (2026-01-14)</small>

* fix(common): add missing repository field for npm provenance validation (#1979) ([7c83889](https://github.com/just-jeb/angular-builders/commit/7c83889)), closes [#1979](https://github.com/just-jeb/angular-builders/issues/1979)

## <small>5.0.3-beta.0 (2026-01-14)</small>

* ci(release): publish ([9c0d187](https://github.com/just-jeb/angular-builders/commit/9c0d187))
* ci(release): publish ([5d8e5f7](https://github.com/just-jeb/angular-builders/commit/5d8e5f7))

## [5.0.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@5.0.1-beta.0...@angular-builders/common@5.0.2) (2026-01-13)

**Note:** Version bump only for package @angular-builders/common

## [5.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@5.0.1-beta.0...@angular-builders/common@5.0.1) (2026-01-12)

**Note:** Version bump only for package @angular-builders/common

## [5.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@5.0.0-beta.1...@angular-builders/common@5.0.1-beta.0) (2026-01-12)

**Note:** Version bump only for package @angular-builders/common

## [5.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@5.0.0-beta.1...@angular-builders/common@5.0.0) (2026-01-12)

**Note:** Version bump only for package @angular-builders/common

## [5.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@4.0.1-beta.0...@angular-builders/common@5.0.0-beta.1) (2025-12-17)

### ⚠ BREAKING CHANGES

* **jest:** Requires Jest 30

Users must upgrade:
npm install --save-dev jest@^30.0.0 jest-environment-jsdom@^30.0.0 jsdom@^26.0.0

Also requires tsconfig.spec.json update for moduleResolution compatibility:
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "isolatedModules": true
  }
}

Schema changes:
- testPathPattern renamed to testPathPatterns
- Removed: browser, init, mapCoverage, testURL, timers
* All packages now require Angular 21

### Features

* **jest:** upgrade to Jest 30 via jest-preset-angular v16 ([ca4b6d9](https://github.com/just-jeb/angular-builders/commit/ca4b6d91372ff0bc2c827135a9f3ce2b4bc3e0f9)), closes [#1931](https://github.com/just-jeb/angular-builders/issues/1931)

### Miscellaneous Chores

* upgrade to Angular 21 ([98059dc](https://github.com/just-jeb/angular-builders/commit/98059dcfc2c2654f4672cb6f4597835522ee50ba)), closes [#1957](https://github.com/just-jeb/angular-builders/issues/1957)

## [5.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@4.0.1-beta.0...@angular-builders/common@5.0.0-beta.0) (2025-12-17)

### ⚠ BREAKING CHANGES

* **jest:** Requires Jest 30

Users must upgrade:
npm install --save-dev jest@^30.0.0 jest-environment-jsdom@^30.0.0 jsdom@^26.0.0

Also requires tsconfig.spec.json update for moduleResolution compatibility:
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "Node16",
    "isolatedModules": true
  }
}

Schema changes:
- testPathPattern renamed to testPathPatterns
- Removed: browser, init, mapCoverage, testURL, timers
* All packages now require Angular 21

### Features

* **jest:** upgrade to Jest 30 via jest-preset-angular v16 ([ca4b6d9](https://github.com/just-jeb/angular-builders/commit/ca4b6d91372ff0bc2c827135a9f3ce2b4bc3e0f9)), closes [#1931](https://github.com/just-jeb/angular-builders/issues/1931)

### Miscellaneous Chores

* upgrade to Angular 21 ([98059dc](https://github.com/just-jeb/angular-builders/commit/98059dcfc2c2654f4672cb6f4597835522ee50ba)), closes [#1957](https://github.com/just-jeb/angular-builders/issues/1957)

## [4.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@4.0.0...@angular-builders/common@4.0.1-beta.0) (2025-11-13)

**Note:** Version bump only for package @angular-builders/common

## [4.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@4.0.0-beta.0...@angular-builders/common@4.0.0) (2025-06-25)

**Note:** Version bump only for package @angular-builders/common

## [4.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@3.0.1...@angular-builders/common@4.0.0-beta.0) (2025-06-19)

### ⚠ BREAKING CHANGES

* **deps:** upgrade to Angular 20

### Features

* migrate to @angular/build ([db2fc68](https://github.com/just-jeb/angular-builders/commit/db2fc689cf58be44bcbee6a13e9729ec88138e1b))

### Miscellaneous Chores

* **deps:** upgrade to Angular 20 ([4f673a8](https://github.com/just-jeb/angular-builders/commit/4f673a8ae090c226b67c4e249a161a968e1964da))

## [3.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@3.0.1-beta.0...@angular-builders/common@3.0.1) (2025-04-07)

**Note:** Version bump only for package @angular-builders/common

## [3.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@3.0.0...@angular-builders/common@3.0.1-beta.0) (2025-04-06)

**Note:** Version bump only for package @angular-builders/common

## [3.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@3.0.0-beta.0...@angular-builders/common@3.0.0) (2025-01-05)

**Note:** Version bump only for package @angular-builders/common

## [3.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@2.0.0...@angular-builders/common@3.0.0-beta.0) (2024-12-05)

### ⚠ BREAKING CHANGES

* **deps:** update to Angular 19 (#1871)

### Miscellaneous Chores

* **deps:** update to Angular 19 ([#1871](https://github.com/just-jeb/angular-builders/issues/1871)) ([d3b17ed](https://github.com/just-jeb/angular-builders/commit/d3b17ed1e520c299f0327b9b5c38a55494b0a19a))

## [2.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@2.0.0-beta.1...@angular-builders/common@2.0.0) (2024-06-17)

**Note:** Version bump only for package @angular-builders/common

## [2.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.3-beta.1...@angular-builders/common@2.0.0-beta.1) (2024-05-30)

### ⚠ BREAKING CHANGES

- update to Angular 18 (#1787)

### Miscellaneous Chores

- update to Angular 18 ([#1787](https://github.com/just-jeb/angular-builders/issues/1787)) ([eba47d5](https://github.com/just-jeb/angular-builders/commit/eba47d5749cdee361646895cc3d53e96868aa9d1))

## [2.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.3-beta.1...@angular-builders/common@2.0.0-beta.0) (2024-05-30)

### ⚠ BREAKING CHANGES

- update to Angular 18 (#1787)

### Miscellaneous Chores

- update to Angular 18 ([#1787](https://github.com/just-jeb/angular-builders/issues/1787)) ([eba47d5](https://github.com/just-jeb/angular-builders/commit/eba47d5749cdee361646895cc3d53e96868aa9d1))

## [1.0.3-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.3-beta.0...@angular-builders/common@1.0.3-beta.1) (2024-04-10)

**Note:** Version bump only for package @angular-builders/common

## [1.0.3-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.2...@angular-builders/common@1.0.3-beta.0) (2024-04-04)

**Note:** Version bump only for package @angular-builders/common

## [1.0.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.2-beta.1...@angular-builders/common@1.0.2) (2024-04-02)

**Note:** Version bump only for package @angular-builders/common

## [1.0.2-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.2-beta.0...@angular-builders/common@1.0.2-beta.1) (2024-03-21)

**Note:** Version bump only for package @angular-builders/common

## [1.0.2-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.1...@angular-builders/common@1.0.2-beta.0) (2024-03-14)

**Note:** Version bump only for package @angular-builders/common

## [1.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/common@1.0.1-beta.0...@angular-builders/common@1.0.1) (2024-02-15)

**Note:** Version bump only for package @angular-builders/common

## 1.0.1-beta.0 (2024-02-04)

**Note:** Version bump only for package @angular-builders/common
