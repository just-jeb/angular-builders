# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [22.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@22.0.1-beta.1...@angular-builders/custom-esbuild@22.0.1) (2026-06-23)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [22.0.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@22.0.1-beta.0...@angular-builders/custom-esbuild@22.0.1-beta.1) (2026-06-22)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [22.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@22.0.0...@angular-builders/custom-esbuild@22.0.1-beta.0) (2026-06-18)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [22.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@22.0.0-beta.1...@angular-builders/custom-esbuild@22.0.0) (2026-06-10)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [22.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@22.0.0-beta.0...@angular-builders/custom-esbuild@22.0.0-beta.1) (2026-06-09)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [22.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0...@angular-builders/custom-esbuild@22.0.0-beta.0) (2026-06-09)

### ⚠ BREAKING CHANGES

- All packages now require Angular 22.
- User TypeScript config/plugin modules now load via `jiti` instead of `ts-node`. Configs are transpiled rather than type-checked (run `tsc --noEmit` separately if you relied on build-time type-checking); `ts-node` and `tsconfig-paths` are no longer dependencies; and the `NODE_OPTIONS='--loader ts-node/esm'` workaround for ESM apps is no longer needed.

### Features

- ng add / ng update schematics for jest, custom-esbuild, custom-webpack ([#2267](https://github.com/just-jeb/angular-builders/issues/2267)) ([062f423](https://github.com/just-jeb/angular-builders/commit/062f423cbe2f87d97017ef4801cf6afb209f9191)), closes [#22](https://github.com/just-jeb/angular-builders/issues/22)
- replace ts-node with jiti for loading TypeScript modules ([#2287](https://github.com/just-jeb/angular-builders/issues/2287)) ([0348e06](https://github.com/just-jeb/angular-builders/commit/0348e06df73f57e62a8803a20c8b7b66b664a5d0)), closes [#816](https://github.com/just-jeb/angular-builders/issues/816)
- upgrade builders + examples to Angular 22 (22.0.0-rc.2) ([#2264](https://github.com/just-jeb/angular-builders/issues/2264)) ([9ed7020](https://github.com/just-jeb/angular-builders/commit/9ed7020edc14b706fb3bbcbf811ac8ad3ea7e132))

### Miscellaneous Chores

- graduate Angular 22 from RC to GA ([daec882](https://github.com/just-jeb/angular-builders/commit/daec8828f1dcd34c989af6ae782a431b3f3205ee))

## [21.1.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.16...@angular-builders/custom-esbuild@21.1.0) (2026-06-08)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.16](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.15...@angular-builders/custom-esbuild@21.1.0-beta.16) (2026-06-05)

### Reverts

- remove redundant TS2742 builder annotations ([#2275](https://github.com/just-jeb/angular-builders/issues/2275), [#2278](https://github.com/just-jeb/angular-builders/issues/2278)) ([#2279](https://github.com/just-jeb/angular-builders/issues/2279)) ([a2882e5](https://github.com/just-jeb/angular-builders/commit/a2882e511ae2fa44dc445dbc9e73882de70981b5))

## [21.1.0-beta.15](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.14...@angular-builders/custom-esbuild@21.1.0-beta.15) (2026-06-04)

### Bug Fixes

- **builders:** annotate builder default exports with Builder<T> to avoid TS2742 ([#2278](https://github.com/just-jeb/angular-builders/issues/2278)) ([7db3848](https://github.com/just-jeb/angular-builders/commit/7db3848c7c3bf8362904130cbab8c7711cdac4ed))

## [21.1.0-beta.14](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.13...@angular-builders/custom-esbuild@21.1.0-beta.14) (2026-06-01)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.13](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.12...@angular-builders/custom-esbuild@21.1.0-beta.13) (2026-06-01)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.12](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.11...@angular-builders/custom-esbuild@21.1.0-beta.12) (2026-05-09)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.11](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.10...@angular-builders/custom-esbuild@21.1.0-beta.11) (2026-05-08)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.10](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.9...@angular-builders/custom-esbuild@21.1.0-beta.10) (2026-05-07)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.9](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.8...@angular-builders/custom-esbuild@21.1.0-beta.9) (2026-04-26)

### Bug Fixes

- **deps:** add rxjs>=7 as peer dependency to custom-esbuild, custom-webpack, and jest (fixes [#1863](https://github.com/just-jeb/angular-builders/issues/1863)) ([#2188](https://github.com/just-jeb/angular-builders/issues/2188)) ([2e067f5](https://github.com/just-jeb/angular-builders/commit/2e067f51eb3efb65fbef7050b8a10c499a585f0a))

## [21.1.0-beta.8](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.7...@angular-builders/custom-esbuild@21.1.0-beta.8) (2026-04-24)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.7](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.6...@angular-builders/custom-esbuild@21.1.0-beta.7) (2026-03-10)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.6](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.5...@angular-builders/custom-esbuild@21.1.0-beta.6) (2026-02-23)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.5](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.4...@angular-builders/custom-esbuild@21.1.0-beta.5) (2026-02-22)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.4](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.3...@angular-builders/custom-esbuild@21.1.0-beta.4) (2026-02-18)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.2...@angular-builders/custom-esbuild@21.1.0-beta.3) (2026-02-18)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.1...@angular-builders/custom-esbuild@21.1.0-beta.2) (2026-02-16)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.1.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.1.0-beta.0...@angular-builders/custom-esbuild@21.1.0-beta.1) (2026-02-15)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## 21.1.0-beta.0 (2026-01-18)

- feat(ci): add Turborepo for affected detection (#1981) ([884098b](https://github.com/just-jeb/angular-builders/commit/884098b)), closes [#1981](https://github.com/just-jeb/angular-builders/issues/1981)

## <small>21.0.4-beta.0 (2026-01-16)</small>

- ci: revamp CI/CD with parallel matrix jobs (#1980) ([8de5b74](https://github.com/just-jeb/angular-builders/commit/8de5b74)), closes [#1980](https://github.com/just-jeb/angular-builders/issues/1980)

## <small>21.0.3 (2026-01-14)</small>

**Note:** Version bump only for package @angular-builders/custom-esbuild

## <small>21.0.3-beta.1 (2026-01-14)</small>

**Note:** Version bump only for package @angular-builders/custom-esbuild

## <small>21.0.3-beta.0 (2026-01-14)</small>

- ci(release): publish ([9c0d187](https://github.com/just-jeb/angular-builders/commit/9c0d187))
- ci(release): publish ([5d8e5f7](https://github.com/just-jeb/angular-builders/commit/5d8e5f7))

## [21.0.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.0.1-beta.0...@angular-builders/custom-esbuild@21.0.2) (2026-01-13)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.0.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.0.1-beta.0...@angular-builders/custom-esbuild@21.0.1) (2026-01-12)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.0.0-beta.1...@angular-builders/custom-esbuild@21.0.1-beta.0) (2026-01-12)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@21.0.0-beta.1...@angular-builders/custom-esbuild@21.0.0) (2026-01-12)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [21.0.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@20.1.0-beta.1...@angular-builders/custom-esbuild@21.0.0-beta.1) (2025-12-17)

### ⚠ BREAKING CHANGES

- All packages now require Angular 21

### Miscellaneous Chores

- upgrade to Angular 21 ([98059dc](https://github.com/just-jeb/angular-builders/commit/98059dcfc2c2654f4672cb6f4597835522ee50ba)), closes [#1957](https://github.com/just-jeb/angular-builders/issues/1957)

## [21.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@20.1.0-beta.1...@angular-builders/custom-esbuild@21.0.0-beta.0) (2025-12-17)

### ⚠ BREAKING CHANGES

- All packages now require Angular 21

### Miscellaneous Chores

- upgrade to Angular 21 ([98059dc](https://github.com/just-jeb/angular-builders/commit/98059dcfc2c2654f4672cb6f4597835522ee50ba)), closes [#1957](https://github.com/just-jeb/angular-builders/issues/1957)

## [20.1.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@20.1.0-beta.0...@angular-builders/custom-esbuild@20.1.0-beta.1) (2025-11-13)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [20.1.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@20.0.0...@angular-builders/custom-esbuild@20.1.0-beta.0) (2025-11-10)

### Features

- **custom-esbuild:** add `unit-test` builder ([#1935](https://github.com/just-jeb/angular-builders/issues/1935)) ([00972a8](https://github.com/just-jeb/angular-builders/commit/00972a880d4747c521d4aa5f03b7268ec0b43e29))

## [20.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@20.0.0-beta.0...@angular-builders/custom-esbuild@20.0.0) (2025-06-25)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [20.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@19.1.0...@angular-builders/custom-esbuild@20.0.0-beta.0) (2025-06-19)

### ⚠ BREAKING CHANGES

- **deps:** upgrade to Angular 20

### Features

- **custom-esbuild:** expose builder options to plugins ([2c114d9](https://github.com/just-jeb/angular-builders/commit/2c114d9ccf105d8bbf024de9e67a69d625ce2742))
- migrate to @angular/build ([db2fc68](https://github.com/just-jeb/angular-builders/commit/db2fc689cf58be44bcbee6a13e9729ec88138e1b))

### Miscellaneous Chores

- **deps:** upgrade to Angular 20 ([4f673a8](https://github.com/just-jeb/angular-builders/commit/4f673a8ae090c226b67c4e249a161a968e1964da))

## [19.1.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@19.1.0-beta.2...@angular-builders/custom-esbuild@19.1.0) (2025-04-07)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [19.1.0-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@19.1.0-beta.1...@angular-builders/custom-esbuild@19.1.0-beta.2) (2025-04-06)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [19.1.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@19.1.0-beta.0...@angular-builders/custom-esbuild@19.1.0-beta.1) (2025-04-06)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [19.1.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@19.0.0...@angular-builders/custom-esbuild@19.1.0-beta.0) (2025-02-11)

### Features

- **custom-esbuild:** expose current target to index html transform ([#1877](https://github.com/just-jeb/angular-builders/issues/1877)) ([78e2006](https://github.com/just-jeb/angular-builders/commit/78e200609bbdbc7d5d9bc76f5675283bdefc871b))

## [19.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@19.0.0-beta.0...@angular-builders/custom-esbuild@19.0.0) (2025-01-05)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [19.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@18.1.0-beta.0...@angular-builders/custom-esbuild@19.0.0-beta.0) (2024-12-05)

### ⚠ BREAKING CHANGES

- **deps:** update to Angular 19 (#1871)

### Miscellaneous Chores

- **deps:** update to Angular 19 ([#1871](https://github.com/just-jeb/angular-builders/issues/1871)) ([d3b17ed](https://github.com/just-jeb/angular-builders/commit/d3b17ed1e520c299f0327b9b5c38a55494b0a19a))

## [18.1.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@18.0.1-beta.0...@angular-builders/custom-esbuild@18.1.0-beta.0) (2024-11-11)

### Features

- **custom-esbuild:** add support for plugin configuration ([#1683](https://github.com/just-jeb/angular-builders/issues/1683)) ([9fbd32b](https://github.com/just-jeb/angular-builders/commit/9fbd32b0cc279bd9b6eaac1625d25b0c5c78406b))

## [18.0.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@18.0.0...@angular-builders/custom-esbuild@18.0.1-beta.0) (2024-07-23)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [18.0.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@18.0.0-beta.3...@angular-builders/custom-esbuild@18.0.0) (2024-06-17)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [18.0.0-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.3-beta.2...@angular-builders/custom-esbuild@18.0.0-beta.3) (2024-05-30)

### ⚠ BREAKING CHANGES

- update to Angular 18 (#1787)

### Miscellaneous Chores

- update to Angular 18 ([#1787](https://github.com/just-jeb/angular-builders/issues/1787)) ([eba47d5](https://github.com/just-jeb/angular-builders/commit/eba47d5749cdee361646895cc3d53e96868aa9d1))

## [18.0.0-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.3-beta.2...@angular-builders/custom-esbuild@18.0.0-beta.0) (2024-05-30)

### ⚠ BREAKING CHANGES

- update to Angular 18 (#1787)

### Miscellaneous Chores

- update to Angular 18 ([#1787](https://github.com/just-jeb/angular-builders/issues/1787)) ([eba47d5](https://github.com/just-jeb/angular-builders/commit/eba47d5749cdee361646895cc3d53e96868aa9d1))

## [17.1.3-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.3-beta.1...@angular-builders/custom-esbuild@17.1.3-beta.2) (2024-05-27)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.3-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.3-beta.0...@angular-builders/custom-esbuild@17.1.3-beta.1) (2024-04-10)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.3-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.2...@angular-builders/custom-esbuild@17.1.3-beta.0) (2024-04-04)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.2-beta.3...@angular-builders/custom-esbuild@17.1.2) (2024-04-02)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.2-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.2-beta.2...@angular-builders/custom-esbuild@17.1.2-beta.3) (2024-03-31)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.2-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.2-beta.1...@angular-builders/custom-esbuild@17.1.2-beta.2) (2024-03-31)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.2-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.2-beta.0...@angular-builders/custom-esbuild@17.1.2-beta.1) (2024-03-21)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.2-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.1...@angular-builders/custom-esbuild@17.1.2-beta.0) (2024-03-14)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.1-beta.1...@angular-builders/custom-esbuild@17.1.1) (2024-02-26)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.1-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.1-beta.0...@angular-builders/custom-esbuild@17.1.1-beta.1) (2024-02-26)

### Bug Fixes

- **custom-esbuild:** add type to schema extension ([#1689](https://github.com/just-jeb/angular-builders/issues/1689)) ([133f413](https://github.com/just-jeb/angular-builders/commit/133f41340936fd6055b289e9b5851d1b8d745708))

## [17.1.1-beta.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.0...@angular-builders/custom-esbuild@17.1.1-beta.0) (2024-02-20)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.0](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.0-beta.3...@angular-builders/custom-esbuild@17.1.0) (2024-02-15)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.0-beta.3](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.0-beta.2...@angular-builders/custom-esbuild@17.1.0-beta.3) (2024-02-04)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## [17.1.0-beta.2](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.0-beta.1...@angular-builders/custom-esbuild@17.1.0-beta.2) (2024-02-04)

### Features

- **custom-esbuild:** allow exporting list of plugins ([#1658](https://github.com/just-jeb/angular-builders/issues/1658)) ([08c3bde](https://github.com/just-jeb/angular-builders/commit/08c3bde178ae2a9353fb044b0c34292e11323deb))

## [17.1.0-beta.1](https://github.com/just-jeb/angular-builders/compare/@angular-builders/custom-esbuild@17.1.0-beta.0...@angular-builders/custom-esbuild@17.1.0-beta.1) (2024-02-01)

**Note:** Version bump only for package @angular-builders/custom-esbuild

## 17.1.0-beta.0 (2024-01-31)

### Features

- **custom-esbuild:** allow providing ESBuild plugins ([#1536](https://github.com/just-jeb/angular-builders/issues/1536)) ([3bc5a4d](https://github.com/just-jeb/angular-builders/commit/3bc5a4d564ecbf67abab745389d3658cb69ff7b9)), closes [#1617](https://github.com/just-jeb/angular-builders/issues/1617) [#1537](https://github.com/just-jeb/angular-builders/issues/1537) [#1288](https://github.com/just-jeb/angular-builders/issues/1288)
