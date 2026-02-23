# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [21.0.4-beta.6](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.4-beta.5...@angular-builders/jest@21.0.4-beta.6) (2026-02-23)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.4-beta.5](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.4-beta.4...@angular-builders/jest@21.0.4-beta.5) (2026-02-22)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.4-beta.4](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.4-beta.3...@angular-builders/jest@21.0.4-beta.4) (2026-02-18)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.4-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.4-beta.2...@angular-builders/jest@21.0.4-beta.3) (2026-02-18)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.4-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.4-beta.1...@angular-builders/jest@21.0.4-beta.2) (2026-02-16)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.4-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.4-beta.0...@angular-builders/jest@21.0.4-beta.1) (2026-02-15)

### Bug Fixes

* **jest:** matchMedia mock survives resetMocks option ([#1999](https://github.com/just-jeb/angular-builders/issues/1999)) ([7f2e4b4](https://github.com/just-jeb/angular-builders/commit/7f2e4b411a2d9e5b1702808124bd205ca5d676c2)), closes [#1983](https://github.com/just-jeb/angular-builders/issues/1983)

## <small>21.0.4-beta.0 (2026-01-16)</small>

* ci: revamp CI/CD with parallel matrix jobs (#1980) ([8de5b74](https://github.com/just-jeb/angular-builders/commit/8de5b74)), closes [#1980](https://github.com/just-jeb/angular-builders/issues/1980)

## <small>21.0.3 (2026-01-14)</small>

**Note:** Version bump only for package @angular-builders/jest

## <small>21.0.3-beta.1 (2026-01-14)</small>

**Note:** Version bump only for package @angular-builders/jest

## <small>21.0.3-beta.0 (2026-01-14)</small>

* ci(release): publish ([9c0d187](https://github.com/just-jeb/angular-builders/commit/9c0d187))
* ci(release): publish ([5d8e5f7](https://github.com/just-jeb/angular-builders/commit/5d8e5f7))

## [21.0.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.1-beta.0...@angular-builders/jest@21.0.2) (2026-01-13)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.1-beta.0...@angular-builders/jest@21.0.1) (2026-01-12)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.0-beta.1...@angular-builders/jest@21.0.1-beta.0) (2026-01-12)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@21.0.0-beta.1...@angular-builders/jest@21.0.0) (2026-01-12)

**Note:** Version bump only for package @angular-builders/jest

## [21.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@20.0.1-beta.1...@angular-builders/jest@21.0.0-beta.1) (2025-12-17)

### ⚠ BREAKING CHANGES

* **jest:** configPath option renamed to config

The config option now accepts:
- File path (string): "jest.config.js"
- JSON string: '{"verbose": true}'
- Inline object in angular.json
* **jest:** zoneless is now the default

Apps using zone.js change detection must set zoneless: false in angular.json.

globalMocks option now only supports matchMedia. The styleTransform,
getComputedStyle, and doctype mocks have been removed as Jest 30's
jsdom supports these natively.
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

* **jest:** add zoneless testing support ([1f23ca4](https://github.com/just-jeb/angular-builders/commit/1f23ca453017c40d4b78a9383eb8ccd19959a234)), closes [#1934](https://github.com/just-jeb/angular-builders/issues/1934)
* **jest:** rename configPath to config with object support ([7bfe312](https://github.com/just-jeb/angular-builders/commit/7bfe31233d86cd04798055d19a552e7d8ab424a3)), closes [#108](https://github.com/just-jeb/angular-builders/issues/108)
* **jest:** upgrade to Jest 30 via jest-preset-angular v16 ([ca4b6d9](https://github.com/just-jeb/angular-builders/commit/ca4b6d91372ff0bc2c827135a9f3ce2b4bc3e0f9)), closes [#1931](https://github.com/just-jeb/angular-builders/issues/1931)

### Miscellaneous Chores

* upgrade to Angular 21 ([98059dc](https://github.com/just-jeb/angular-builders/commit/98059dcfc2c2654f4672cb6f4597835522ee50ba)), closes [#1957](https://github.com/just-jeb/angular-builders/issues/1957)

## [21.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@20.0.1-beta.1...@angular-builders/jest@21.0.0-beta.0) (2025-12-17)

### ⚠ BREAKING CHANGES

* **jest:** configPath option renamed to config

The config option now accepts:
- File path (string): "jest.config.js"
- JSON string: '{"verbose": true}'
- Inline object in angular.json
* **jest:** zoneless is now the default

Apps using zone.js change detection must set zoneless: false in angular.json.

globalMocks option now only supports matchMedia. The styleTransform,
getComputedStyle, and doctype mocks have been removed as Jest 30's
jsdom supports these natively.
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

* **jest:** add zoneless testing support ([1f23ca4](https://github.com/just-jeb/angular-builders/commit/1f23ca453017c40d4b78a9383eb8ccd19959a234)), closes [#1934](https://github.com/just-jeb/angular-builders/issues/1934)
* **jest:** rename configPath to config with object support ([7bfe312](https://github.com/just-jeb/angular-builders/commit/7bfe31233d86cd04798055d19a552e7d8ab424a3)), closes [#108](https://github.com/just-jeb/angular-builders/issues/108)
* **jest:** upgrade to Jest 30 via jest-preset-angular v16 ([ca4b6d9](https://github.com/just-jeb/angular-builders/commit/ca4b6d91372ff0bc2c827135a9f3ce2b4bc3e0f9)), closes [#1931](https://github.com/just-jeb/angular-builders/issues/1931)

### Miscellaneous Chores

* upgrade to Angular 21 ([98059dc](https://github.com/just-jeb/angular-builders/commit/98059dcfc2c2654f4672cb6f4597835522ee50ba)), closes [#1957](https://github.com/just-jeb/angular-builders/issues/1957)

## [20.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@20.0.1-beta.0...@angular-builders/jest@20.0.1-beta.1) (2025-11-13)

**Note:** Version bump only for package @angular-builders/jest

## [20.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@20.0.0...@angular-builders/jest@20.0.1-beta.0) (2025-11-11)

**Note:** Version bump only for package @angular-builders/jest

## [20.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@20.0.0-beta.0...@angular-builders/jest@20.0.0) (2025-06-25)

**Note:** Version bump only for package @angular-builders/jest

## [20.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@19.0.1...@angular-builders/jest@20.0.0-beta.0) (2025-06-19)

### ⚠ BREAKING CHANGES

* **deps:** upgrade to Angular 20

### Features

* migrate to @angular/build ([db2fc68](https://github.com/just-jeb/angular-builders/commit/db2fc689cf58be44bcbee6a13e9729ec88138e1b))

### Miscellaneous Chores

* **deps:** upgrade to Angular 20 ([4f673a8](https://github.com/just-jeb/angular-builders/commit/4f673a8ae090c226b67c4e249a161a968e1964da))

## [19.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@19.0.1-beta.1...@angular-builders/jest@19.0.1) (2025-04-07)

**Note:** Version bump only for package @angular-builders/jest

## [19.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@19.0.1-beta.0...@angular-builders/jest@19.0.1-beta.1) (2025-04-06)

**Note:** Version bump only for package @angular-builders/jest

## [19.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@19.0.0...@angular-builders/jest@19.0.1-beta.0) (2025-04-06)

**Note:** Version bump only for package @angular-builders/jest

## [19.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@19.0.0-beta.1...@angular-builders/jest@19.0.0) (2025-01-05)

**Note:** Version bump only for package @angular-builders/jest

## [19.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@19.0.0-beta.0...@angular-builders/jest@19.0.0-beta.1) (2024-12-06)

**Note:** Version bump only for package @angular-builders/jest

## [19.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@18.0.1-beta.2...@angular-builders/jest@19.0.0-beta.0) (2024-12-05)

### ⚠ BREAKING CHANGES

* **deps:** update to Angular 19 (#1871)

### Miscellaneous Chores

* **deps:** update to Angular 19 ([#1871](https://github.com/just-jeb/angular-builders/issues/1871)) ([d3b17ed](https://github.com/just-jeb/angular-builders/commit/d3b17ed1e520c299f0327b9b5c38a55494b0a19a))

## [18.0.1-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@18.0.1-beta.1...@angular-builders/jest@18.0.1-beta.2) (2024-10-30)

**Note:** Version bump only for package @angular-builders/jest

## [18.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@18.0.1-beta.0...@angular-builders/jest@18.0.1-beta.1) (2024-07-23)

**Note:** Version bump only for package @angular-builders/jest

## [18.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@18.0.0...@angular-builders/jest@18.0.1-beta.0) (2024-06-20)

**Note:** Version bump only for package @angular-builders/jest

## [18.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@18.0.0-beta.3...@angular-builders/jest@18.0.0) (2024-06-17)

**Note:** Version bump only for package @angular-builders/jest

## [18.0.0-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.4-beta.3...@angular-builders/jest@18.0.0-beta.3) (2024-05-30)

### ⚠ BREAKING CHANGES

- update to Angular 18 (#1787)

### Miscellaneous Chores

- update to Angular 18 ([#1787](https://github.com/just-jeb/angular-builders/issues/1787)) ([eba47d5](https://github.com/just-jeb/angular-builders/commit/eba47d5749cdee361646895cc3d53e96868aa9d1))

## [18.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.4-beta.3...@angular-builders/jest@18.0.0-beta.0) (2024-05-30)

### ⚠ BREAKING CHANGES

- update to Angular 18 (#1787)

### Miscellaneous Chores

- update to Angular 18 ([#1787](https://github.com/just-jeb/angular-builders/issues/1787)) ([eba47d5](https://github.com/just-jeb/angular-builders/commit/eba47d5749cdee361646895cc3d53e96868aa9d1))

## [17.0.4-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.4-beta.2...@angular-builders/jest@17.0.4-beta.3) (2024-05-22)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.4-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.4-beta.1...@angular-builders/jest@17.0.4-beta.2) (2024-05-08)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.4-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.4-beta.0...@angular-builders/jest@17.0.4-beta.1) (2024-04-10)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.4-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.3...@angular-builders/jest@17.0.4-beta.0) (2024-04-04)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.3-beta.1...@angular-builders/jest@17.0.3) (2024-04-02)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.3-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.3-beta.0...@angular-builders/jest@17.0.3-beta.1) (2024-03-21)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.3-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.2...@angular-builders/jest@17.0.3-beta.0) (2024-03-14)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.2-beta.0...@angular-builders/jest@17.0.2) (2024-02-26)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.2-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.1...@angular-builders/jest@17.0.2-beta.0) (2024-02-16)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.1-beta.5...@angular-builders/jest@17.0.1) (2024-02-15)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.1-beta.5](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.1-beta.4...@angular-builders/jest@17.0.1-beta.5) (2024-02-15)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.1-beta.4](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.1-beta.3...@angular-builders/jest@17.0.1-beta.4) (2024-02-04)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.1-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.1-beta.2...@angular-builders/jest@17.0.1-beta.3) (2024-01-18)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.1-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.1-beta.1...@angular-builders/jest@17.0.1-beta.2) (2024-01-14)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.1-beta.0...@angular-builders/jest@17.0.1-beta.1) (2024-01-11)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.0...@angular-builders/jest@17.0.1-beta.0) (2024-01-04)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@17.0.0-beta.0...@angular-builders/jest@17.0.0) (2023-11-13)

**Note:** Version bump only for package @angular-builders/jest

## [17.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.2-beta.3...@angular-builders/jest@17.0.0-beta.0) (2023-11-13)

### ⚠ BREAKING CHANGES

- **deps:** update to Angular 17 (#1518)

### Miscellaneous Chores

- **deps:** update to Angular 17 ([#1518](https://github.com/just-jeb/angular-builders/issues/1518)) ([236d0ac](https://github.com/just-jeb/angular-builders/commit/236d0acf7c46dc70787d8447fad79912a71e880b))

## [16.0.2-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.2-beta.2...@angular-builders/jest@16.0.2-beta.3) (2023-10-01)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.2-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.2-beta.1...@angular-builders/jest@16.0.2-beta.2) (2023-09-12)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.2-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.2-beta.0...@angular-builders/jest@16.0.2-beta.1) (2023-08-24)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.2-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.1...@angular-builders/jest@16.0.2-beta.0) (2023-08-23)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.1-beta.3...@angular-builders/jest@16.0.1) (2023-08-23)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.1-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.1-beta.2...@angular-builders/jest@16.0.1-beta.3) (2023-08-23)

### Bug Fixes

- **jest:** set path to tsconfig correctly ([#1443](https://github.com/just-jeb/angular-builders/issues/1443)) ([2918f2b](https://github.com/just-jeb/angular-builders/commit/2918f2b7b1ea33a0798527b4fcef97b5d6e26a66)), closes [#1408](https://github.com/just-jeb/angular-builders/issues/1408)

## [16.0.1-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.1-beta.1...@angular-builders/jest@16.0.1-beta.2) (2023-07-06)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.1-beta.0...@angular-builders/jest@16.0.1-beta.1) (2023-07-04)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.0...@angular-builders/jest@16.0.1-beta.0) (2023-07-04)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.0-beta.4...@angular-builders/jest@16.0.0) (2023-05-31)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.0-beta.4](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.0-beta.3...@angular-builders/jest@16.0.0-beta.4) (2023-05-31)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.0-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.0-beta.2...@angular-builders/jest@16.0.0-beta.3) (2023-05-24)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.0-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.0-beta.1...@angular-builders/jest@16.0.0-beta.2) (2023-05-22)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@16.0.0-beta.0...@angular-builders/jest@16.0.0-beta.1) (2023-05-21)

**Note:** Version bump only for package @angular-builders/jest

## [16.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@15.0.1-beta.1...@angular-builders/jest@16.0.0-beta.0) (2023-05-17)

### ⚠ BREAKING CHANGES

- **deps:** update to Angular 16 (#1357)

### Miscellaneous Chores

- **deps:** update to Angular 16 ([#1357](https://github.com/just-jeb/angular-builders/issues/1357)) ([06392ae](https://github.com/just-jeb/angular-builders/commit/06392ae894896f2ba863991e486b57a7abc80c3c))

## [15.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@15.0.1-beta.0...@angular-builders/jest@15.0.1-beta.1) (2023-03-14)

**Note:** Version bump only for package @angular-builders/jest

## [15.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@15.0.0...@angular-builders/jest@15.0.1-beta.0) (2023-01-23)

**Note:** Version bump only for package @angular-builders/jest

## [15.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@15.0.0-beta.2...@angular-builders/jest@15.0.0) (2022-12-20)

**Note:** Version bump only for package @angular-builders/jest

## [15.0.0-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@15.0.0-beta.1...@angular-builders/jest@15.0.0-beta.2) (2022-12-09)

### Features

- **jest:** support Jest config in different formats ([#1325](https://github.com/just-jeb/angular-builders/issues/1325)) ([bc19a54](https://github.com/just-jeb/angular-builders/commit/bc19a5425585fac6d0aa3c8ac4e6b0640a0d2a0c))

## [15.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@15.0.0-beta.0...@angular-builders/jest@15.0.0-beta.1) (2022-11-26)

**Note:** Version bump only for package @angular-builders/jest

## [15.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.1.1-beta.0...@angular-builders/jest@15.0.0-beta.0) (2022-11-24)

### ⚠ BREAKING CHANGES

- **deps:** update to Angular 15, tsconfig-paths 4 (#1319)

### Miscellaneous Chores

- **deps:** update to Angular 15, tsconfig-paths 4 ([#1319](https://github.com/just-jeb/angular-builders/issues/1319)) ([dd47762](https://github.com/just-jeb/angular-builders/commit/dd47762b7da037f7b1bf3ebf6f8ebed4a9819ecb))

## [14.1.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.1.0...@angular-builders/jest@14.1.1-beta.0) (2022-11-17)

**Note:** Version bump only for package @angular-builders/jest

## [14.1.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.1.0-beta.0...@angular-builders/jest@14.1.0) (2022-11-16)

**Note:** Version bump only for package @angular-builders/jest

## [14.1.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.2...@angular-builders/jest@14.1.0-beta.0) (2022-11-16)

### Features

- **jest:** support shard CLI options ([#1314](https://github.com/just-jeb/angular-builders/issues/1314)) ([#1315](https://github.com/just-jeb/angular-builders/issues/1315)) ([7ddad99](https://github.com/just-jeb/angular-builders/commit/7ddad997c39507c97b099907ab63c36fd0bfead2))

## [14.0.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.2-beta.2...@angular-builders/jest@14.0.2) (2022-10-31)

**Note:** Version bump only for package @angular-builders/jest

## [14.0.2-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.2-beta.1...@angular-builders/jest@14.0.2-beta.2) (2022-10-31)

### Bug Fixes

- jest no-cache option ([#1290](https://github.com/just-jeb/angular-builders/issues/1290)) ([4cc057c](https://github.com/just-jeb/angular-builders/commit/4cc057cbb46c5a581dd519443a836d54de40d092))

### [14.0.2-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.2-beta.0...@angular-builders/jest@14.0.2-beta.1) (2022-10-18)

### Bug Fixes

- remove conflicting commands and aliases ([#1281](https://github.com/just-jeb/angular-builders/issues/1281)) ([38e5aa9](https://github.com/just-jeb/angular-builders/commit/38e5aa96ce823a6264c2c7a43fc63aed27fde671))

### [14.0.2-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.1...@angular-builders/jest@14.0.2-beta.0) (2022-09-28)

**Note:** Version bump only for package @angular-builders/jest

### [14.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.1-beta.3...@angular-builders/jest@14.0.1) (2022-08-23)

**Note:** Version bump only for package @angular-builders/jest

### [14.0.1-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.1-beta.2...@angular-builders/jest@14.0.1-beta.3) (2022-08-19)

**Note:** Version bump only for package @angular-builders/jest

### [14.0.1-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.1-beta.1...@angular-builders/jest@14.0.1-beta.2) (2022-08-18)

**Note:** Version bump only for package @angular-builders/jest

### [14.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.1-beta.0...@angular-builders/jest@14.0.1-beta.1) (2022-08-18)

**Note:** Version bump only for package @angular-builders/jest

### [14.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.0...@angular-builders/jest@14.0.1-beta.0) (2022-06-27)

**Note:** Version bump only for package @angular-builders/jest

## [14.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@14.0.0-beta.0...@angular-builders/jest@14.0.0) (2022-06-13)

**Note:** Version bump only for package @angular-builders/jest

## [14.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.4...@angular-builders/jest@14.0.0-beta.0) (2022-06-09)

### ⚠ BREAKING CHANGES

- **deps:** update to Angular CLI 14 and Jest 28

### Bug Fixes

- **jest:** default value for computed style global mock ([60b2005](https://github.com/just-jeb/angular-builders/commit/60b20058e4464e0996c9baa5ec8df7c25ed64393))

### Miscellaneous Chores

- **deps:** update to Angular CLI 14 and Jest 28 ([3b09c27](https://github.com/just-jeb/angular-builders/commit/3b09c27bca0830c4fbd934c9b628df232149a948))

### [13.0.4](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.4-beta.1...@angular-builders/jest@13.0.4) (2022-05-12)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.4-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.4-beta.0...@angular-builders/jest@13.0.4-beta.1) (2022-05-11)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.4-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.3...@angular-builders/jest@13.0.4-beta.0) (2022-02-12)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.3-beta.3...@angular-builders/jest@13.0.3) (2022-01-31)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.3-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.3-beta.2...@angular-builders/jest@13.0.3-beta.3) (2022-01-21)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.3-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.3-beta.1...@angular-builders/jest@13.0.3-beta.2) (2022-01-19)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.3-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.3-beta.0...@angular-builders/jest@13.0.3-beta.1) (2022-01-18)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.3-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.2...@angular-builders/jest@13.0.3-beta.0) (2021-12-16)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.2-beta.0...@angular-builders/jest@13.0.2) (2021-12-06)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.2-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.1...@angular-builders/jest@13.0.2-beta.0) (2021-12-05)

### Bug Fixes

- **jest:** find-related-tests schema.json ([#1067](https://github.com/just-jeb/angular-builders/issues/1067)) ([3cd4b8b](https://github.com/just-jeb/angular-builders/commit/3cd4b8b44e8486c3bda5c8adee3041e629bd215c))

### [13.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.1-beta.0...@angular-builders/jest@13.0.1) (2021-12-01)

**Note:** Version bump only for package @angular-builders/jest

### [13.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.0...@angular-builders/jest@13.0.1-beta.0) (2021-11-30)

**Note:** Version bump only for package @angular-builders/jest

## [13.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.0-beta.2...@angular-builders/jest@13.0.0) (2021-11-09)

**Note:** Version bump only for package @angular-builders/jest

## [13.0.0-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.0-beta.1...@angular-builders/jest@13.0.0-beta.2) (2021-11-09)

**Note:** Version bump only for package @angular-builders/jest

## [13.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@13.0.0-beta.0...@angular-builders/jest@13.0.0-beta.1) (2021-11-08)

**Note:** Version bump only for package @angular-builders/jest

## [13.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.1.2...@angular-builders/jest@13.0.0-beta.0) (2021-11-07)

### ⚠ BREAKING CHANGES

- version 13 (#1051)

### Miscellaneous Chores

- version 13 ([#1051](https://github.com/just-jeb/angular-builders/issues/1051)) ([1a8157c](https://github.com/just-jeb/angular-builders/commit/1a8157c0ab7d3fc535c00909e449f00c85813682))

### [12.1.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.1.2-beta.1...@angular-builders/jest@12.1.2) (2021-09-08)

**Note:** Version bump only for package @angular-builders/jest

### [12.1.2-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.1.2-beta.0...@angular-builders/jest@12.1.2-beta.1) (2021-09-05)

### Bug Fixes

- **jest:** accept no-cache option ([#1033](https://github.com/just-jeb/angular-builders/issues/1033)) ([25c03b9](https://github.com/just-jeb/angular-builders/commit/25c03b9c3f2fca7f733e996684726560a9790656))

### [12.1.2-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.1.1...@angular-builders/jest@12.1.2-beta.0) (2021-08-24)

**Note:** Version bump only for package @angular-builders/jest

### [12.1.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.1.1-beta.0...@angular-builders/jest@12.1.1) (2021-08-18)

**Note:** Version bump only for package @angular-builders/jest

### [12.1.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.1.0...@angular-builders/jest@12.1.1-beta.0) (2021-08-17)

### Bug Fixes

- **jest:** allow passing file paths as argument to ng test ([#1025](https://github.com/just-jeb/angular-builders/issues/1025)) ([11cd5d0](https://github.com/just-jeb/angular-builders/commit/11cd5d061ce416bb813c312140bc203b75d9b90c))

## [12.1.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.1.0-beta.0...@angular-builders/jest@12.1.0) (2021-06-08)

**Note:** Version bump only for package @angular-builders/jest

## [12.1.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.0.0...@angular-builders/jest@12.1.0-beta.0) (2021-06-07)

### Features

- **jest:** update to jest-preset-angular@9 ([#913](https://github.com/just-jeb/angular-builders/issues/913)) ([6bd90f8](https://github.com/just-jeb/angular-builders/commit/6bd90f898289466832f91cde9e1304955a7d43e3))

## [12.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@12.0.0-beta.0...@angular-builders/jest@12.0.0) (2021-05-21)

**Note:** Version bump only for package @angular-builders/jest

## [12.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.2.0...@angular-builders/jest@12.0.0-beta.0) (2021-05-14)

### ⚠ BREAKING CHANGES

- **deps:** update to angular 12

- chore(deps): update to node 12.14 on CI

- Update html-webpack-plugin in example

### Miscellaneous Chores

- **deps:** update to angular 12 ([#980](https://github.com/just-jeb/angular-builders/issues/980)) ([ad2772b](https://github.com/just-jeb/angular-builders/commit/ad2772b33d6b62806e791dd908696945a77e7a98)), closes [#972](https://github.com/just-jeb/angular-builders/issues/972)

## [11.2.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.2.0-beta.1...@angular-builders/jest@11.2.0) (2021-04-20)

**Note:** Version bump only for package @angular-builders/jest

## [11.2.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.2.0-beta.0...@angular-builders/jest@11.2.0-beta.1) (2021-04-20)

### Bug Fixes

- **jest:** correct maxWorkers type ([#970](https://github.com/just-jeb/angular-builders/issues/970)) ([eddb4db](https://github.com/just-jeb/angular-builders/commit/eddb4db9d1de883eb937549ce27866b59eb120cb))

## [11.2.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.1.1...@angular-builders/jest@11.2.0-beta.0) (2021-04-13)

### Features

- **jest:** support configurable global mocks ([#965](https://github.com/just-jeb/angular-builders/issues/965)) ([ba6af13](https://github.com/just-jeb/angular-builders/commit/ba6af1308e6782bba873bce4236abf9251124345))

### [11.1.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.1.1-beta.0...@angular-builders/jest@11.1.1) (2021-03-09)

**Note:** Version bump only for package @angular-builders/jest

### [11.1.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.1.0...@angular-builders/jest@11.1.1-beta.0) (2021-03-08)

### Bug Fixes

- **jest:** sync latest jest-preset-angular ([805eb8d](https://github.com/just-jeb/angular-builders/commit/805eb8d0d0dbe37582a32621e0239d0ee107e6b9))

## [11.1.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.1.0-beta.0...@angular-builders/jest@11.1.0) (2021-02-26)

**Note:** Version bump only for package @angular-builders/jest

## 11.1.0-beta.0 (2021-02-03)

### Features

- **custom-webpack:** use application tsconfig file for indexTransform and customWebpackConfig ([#879](https://github.com/just-jeb/angular-builders/issues/879)) ([c85cd10](https://github.com/just-jeb/angular-builders/commit/c85cd103af6047fefbea273ace1d9446829f3651))

### 11.0.1-beta.4 (2021-02-03)

**Note:** Version bump only for package @angular-builders/jest

### 11.0.1-beta.3 (2021-02-03)

**Note:** Version bump only for package @angular-builders/jest

### 11.0.1-beta.2 (2021-02-03)

**Note:** Version bump only for package @angular-builders/jest

### 11.0.1-beta.1 (2021-01-14)

**Note:** Version bump only for package @angular-builders/jest

### 11.0.1-beta.0 (2020-12-27)

**Note:** Version bump only for package @angular-builders/jest

## [11.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@11.0.0-beta.6...@angular-builders/jest@11.0.0) (2020-12-27)

**Note:** Version bump only for package @angular-builders/jest

## 11.0.0-beta.6 (2020-12-27)

**Note:** Version bump only for package @angular-builders/jest

## 11.0.0-beta.5 (2020-12-22)

### Bug Fixes

- **custom-webpack:** allow merging loader name with loader object ([#912](https://github.com/just-jeb/angular-builders/issues/912)) ([a89a35d](https://github.com/just-jeb/angular-builders/commit/a89a35d30276a3d284d304ee710442ee03da351b))

## 11.0.0-beta.4 (2020-12-16)

### Bug Fixes

- **custom-webpack:** fix loaders merge scenario ([#909](https://github.com/just-jeb/angular-builders/issues/909)) ([0f0ad3d](https://github.com/just-jeb/angular-builders/commit/0f0ad3d174ea589538c4474b0509ad3b5f925bf1))

## 11.0.0-beta.3 (2020-12-15)

**Note:** Version bump only for package @angular-builders/jest

## 11.0.0-beta.2 (2020-12-14)

**Note:** Version bump only for package @angular-builders/jest

## [11.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@10.0.2-beta.1...@angular-builders/jest@11.0.0-beta.1) (2020-11-17)

### ⚠ BREAKING CHANGES

- **deps:** update to angular 11 (#874)

### Miscellaneous Chores

- **deps:** update to angular 11 ([#874](https://github.com/just-jeb/angular-builders/issues/874)) ([e0900dd](https://github.com/just-jeb/angular-builders/commit/e0900dd5e89750a6d7c129ce82d71354dc8882be)), closes [#854](https://github.com/just-jeb/angular-builders/issues/854) [#873](https://github.com/just-jeb/angular-builders/issues/873)

## [11.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@10.0.2-beta.1...@angular-builders/jest@11.0.0-beta.0) (2020-11-17)

### ⚠ BREAKING CHANGES

- **deps:** update to angular 11 (#874)

### Miscellaneous Chores

- **deps:** update to angular 11 ([#874](https://github.com/just-jeb/angular-builders/issues/874)) ([e0900dd](https://github.com/just-jeb/angular-builders/commit/e0900dd5e89750a6d7c129ce82d71354dc8882be)), closes [#854](https://github.com/just-jeb/angular-builders/issues/854) [#873](https://github.com/just-jeb/angular-builders/issues/873)

### [10.0.2-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/jest@10.0.2-beta.0...@angular-builders/jest@10.0.2-beta.1) (2020-10-20)

### Bug Fixes

- **jest:** remove local storage mock ([#843](https://github.com/just-jeb/angular-builders/issues/843)) ([f98dfd7](https://github.com/just-jeb/angular-builders/commit/f98dfd79090b45bb9dc510a7d0f59ecc0720f20a))

## <small>10.0.2-beta.0 (2020-09-09)</small>

- Fix CHANGELOG links (#834) ([001b4ab](https://github.com/just-jeb/angular-builders/commit/001b4ab)), closes [#834](https://github.com/just-jeb/angular-builders/issues/834)

## <small>10.0.1 (2020-09-09)</small>

**Note:** Version bump only for package @angular-builders/jest

## <small>10.0.1-beta.1 (2020-09-06)</small>

- chore: update dependencies (#831) ([b475080](https://github.com/just-jeb/angular-builders/commit/b475080)), closes [#831](https://github.com/just-jeb/angular-builders/issues/831)

## <small>10.0.1-beta.0 (2020-09-05)</small>

- fix(jest): support astTransformers object syntax (#828) ([0acd239](https://github.com/just-jeb/angular-builders/commit/0acd239)), closes [#828](https://github.com/just-jeb/angular-builders/issues/828) [#825](https://github.com/just-jeb/angular-builders/issues/825)

## 10.0.0 (2020-07-21)

**Note:** Version bump only for package @angular-builders/jest

## 10.0.0-beta.0 (2020-06-25)

- build!: update to Angular 10 (#782) ([409f356](https://github.com/just-jeb/angular-builders/commit/409f356)), closes [#782](https://github.com/just-jeb/angular-builders/issues/782)

## <small>9.0.1 (2020-04-05)</small>

**Note:** Version bump only for package @angular-builders/jest

## <small>9.0.1-beta.2 (2020-03-29)</small>

- fix: adjust devkit version range to fit 0.9xx.0 (#709) ([99e061f](https://github.com/just-jeb/angular-builders/commit/99e061f)), closes [#709](https://github.com/just-jeb/angular-builders/issues/709)

## <small>9.0.1-beta.1 (2020-03-17)</small>

- fix(jest): bump jest-preset-angular from 8.0.0 to 8.1.2 (#698) ([3e7159b](https://github.com/just-jeb/angular-builders/commit/3e7159b)), closes [#698](https://github.com/just-jeb/angular-builders/issues/698)

## <small>9.0.1-beta.0 (2020-02-23)</small>

- docs: minor fixes (#688) ([7cd52f8](https://github.com/just-jeb/angular-builders/commit/7cd52f8)), closes [#688](https://github.com/just-jeb/angular-builders/issues/688)

## 9.0.0 (2020-02-23)

**Note:** Version bump only for package @angular-builders/jest

## 9.0.0-beta.4 (2020-02-23)

- docs: update README and MIGRATION for v9 (#685) ([92ec06d](https://github.com/just-jeb/angular-builders/commit/92ec06d)), closes [#685](https://github.com/just-jeb/angular-builders/issues/685)

## 9.0.0-beta.3 (2020-02-01)

- fix(jest): improve testsMatch pattern for Jest 25 (#675) ([0e04a6d](https://github.com/just-jeb/angular-builders/commit/0e04a6d)), closes [#675](https://github.com/just-jeb/angular-builders/issues/675)

## 9.0.0-beta.2 (2020-01-30)

- feat: mock matchMedia out of the box (#674) ([bec48ed](https://github.com/just-jeb/angular-builders/commit/bec48ed)), closes [#674](https://github.com/just-jeb/angular-builders/issues/674) [#641](https://github.com/just-jeb/angular-builders/issues/641)

## 9.0.0-beta.1 (2020-01-28)

- docs: add 'next' tag badges (#672) ([441adec](https://github.com/just-jeb/angular-builders/commit/441adec)), closes [#672](https://github.com/just-jeb/angular-builders/issues/672)

## 9.0.0-beta.0 (2020-01-04)

- build!: direct dependency on @angular-devkit 9 ([6f0ac12](https://github.com/just-jeb/angular-builders/commit/6f0ac12))
- feat(jest)!: use jest-preset-angular@8.0.0 ([1a2b043](https://github.com/just-jeb/angular-builders/commit/1a2b043))
- ci: use verdaccio for e2e ([23f9235](https://github.com/just-jeb/angular-builders/commit/23f9235))

## [8.3.2](https://github.com/just-jeb/angular-builders/tree/master/packages/jest/compare/@angular-builders/jest@8.3.1...@angular-builders/jest@8.3.2) (2019-11-29)

**Note:** Version bump only for package @angular-builders/jest

## [8.3.1](https://github.com/just-jeb/angular-builders/tree/master/packages/jest/compare/@angular-builders/jest@8.3.0...@angular-builders/jest@8.3.1) (2019-11-19)

**Note:** Version bump only for package @angular-builders/jest
