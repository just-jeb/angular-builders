# Jest builder for Angular build facade

[![npm version](https://img.shields.io/npm/v/@angular-builders/jest.svg) ![npm (tag)](https://img.shields.io/npm/v/@angular-builders/jest/next.svg) ![npm](https://img.shields.io/npm/dm/@angular-builders/jest.svg)](https://www.npmjs.com/package/@angular-builders/jest)

Allows running `ng test` with Jest instead of Karma & Jasmine.  
The builder comes to provide zero configuration setup for Jest while keeping the workspace clear of boilerplate code.

# This documentation is for the latest major version only

> ⚠️ **Version alignment:** The major version of `@angular-builders/jest` must match the major version of `@angular/core` in your project. For example, Angular 19 requires `@angular-builders/jest`@19.x, Angular 20 requires `@angular-builders/jest`@20.x, etc. Using a mismatched version is the most common source of issues.

## Previous versions

<details>
  <summary>Click to expand</summary>

- [Version 21](https://github.com/just-jeb/angular-builders/blob/21.x.x/packages/jest/README.md)
- [Version 20](https://github.com/just-jeb/angular-builders/blob/20.x.x/packages/jest/README.md)
- [Version 19](https://github.com/just-jeb/angular-builders/blob/19.x.x/packages/jest/README.md)
- [Version 18](https://github.com/just-jeb/angular-builders/blob/18.x.x/packages/jest/README.md)
- [Version 17](https://github.com/just-jeb/angular-builders/blob/17.x.x/packages/jest/README.md)
- [Version 16](https://github.com/just-jeb/angular-builders/blob/16.x.x/packages/jest/README.md)
- [Version 15](https://github.com/just-jeb/angular-builders/blob/15.x.x/packages/jest/README.md)
- [Version 14](https://github.com/just-jeb/angular-builders/blob/14.x.x/packages/jest/README.md)
- [Version 13](https://github.com/just-jeb/angular-builders/blob/13.x.x/packages/jest/README.md)
- [Version 12](https://github.com/just-jeb/angular-builders/blob/12.x.x/packages/jest/README.md)
- [Version 11](https://github.com/just-jeb/angular-builders/blob/11.x.x/packages/jest/README.md)
- [Version 10](https://github.com/just-jeb/angular-builders/blob/10.x.x/packages/jest/README.md)
- [Version 9](https://github.com/just-jeb/angular-builders/blob/9.x.x/packages/jest/README.md)
- [Version 8](https://github.com/just-jeb/angular-builders/blob/8.x.x/packages/jest/README.md)
- [Version 7](https://github.com/just-jeb/angular-builders/blob/7.x.x/packages/jest/README.md)

</details>

## Prerequisites

- [Angular CLI 22](https://www.npmjs.com/package/@angular/cli)
- [Jest 30](https://www.npmjs.com/package/jest)

## Installation

```sh
$ ng add @angular-builders/jest
```

This adds the Jest packages it needs and installs them. On the `test` target of each targeted project, it sets the builder to `@angular-builders/jest:run` and replaces the existing test options wholesale — including any prior Karma or Vitest setup — with a computed `zoneless` value based on whether the project is zone-based. It also rewrites `tsconfig.spec.json` to drop the old framework's types and file entries and add `jest`.

If it detects an existing Karma setup, it removes the Karma devDependencies and deletes `karma.conf.js` and `src/test.ts`. If it finds Vitest instead, it leaves devDependencies and spec files alone — specs using `vi.*` or importing from `vitest` still need porting to the Jest API by hand, and the schematic only warns about this.

Target a single project with `ng add @angular-builders/jest --project my-app`; without it, the schematic falls back to `defaultProject` or runs against every project. It's idempotent, so running it again after adding a project, or after fixing something by hand, is safe.

## Manual setup

`ng add @angular-builders/jest` above already performs everything in this section. It's here for workspaces the schematic doesn't fit — a custom test target, a config layout it doesn't recognize — or if you'd rather wire things up by hand.

### Removing Karma and installing the builder

1. Remove Karma related libraries and files:
   ```sh
   $ npm remove karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter
   $ rm ./karma.conf.js ./src/test.ts
   ```
2. Install the builder (and `jest` if you still haven't):
   ```sh
   $ npm i -D jest @types/jest @angular-builders/jest
   ```

### Updating Typescript configurations

1. In _tsconfig.spec.json_ (root directory, used by Jest):
   - Replace `jasmine` in `types` array with `jest`  
     _You want your tests to be type-checked against Jest typings and not Jasmine._
   - Remove `test.ts` entry from `files` array  
     _This file was responsible for Karma setup, you don't need it here anymore._

2. In _tsconfig.json_ (root directory, used by IDE):
   - Add `jest` to `types` array  
      _Although you run your unit tests with Jest, Protractor (e2e tests) still [has to use Jasmine](https://github.com/angular/protractor/issues/3889). Due to this fact it’s possible that you favorite IDE will get confused with the typings and will propose you Jasmine types in unit tests.  
     `tsconfig.json` is the config file that your IDE uses so you have to instruct it explicitly to use Jest typings.  
      Bear in mind that the other side of the coin is that your IDE will propose you Jest types in your e2e tests._

### Running with Angular CLI

- In your `angular.json`:
  ```json
  "projects": {
    "[your-project]": {
      "architect": {
        "test": {
          "builder": "@angular-builders/jest:run",
          "options": {
            // see below
          }
        }
      }
    }
  }
  ```
- Run the tests: `ng test`

## Multi-projects workspace support

The builder supports multi-project workspaces out of the box, the only thing required is editing _tsconfig.spec.json_ in the relevant project directory as described [above](#updating-typescript-configurations).

## Upgrading with `ng update`

```sh
$ ng update @angular-builders/jest
```

Every migration between your installed version and the target runs in one pass, so a project several majors behind picks them all up in one command. Supported from version 17 onward.

Crossing v21 runs a migration that edits your workspace: it bumps the Jest packages, sets `Node16` module resolution and `isolatedModules` in `tsconfig.spec.json`, renames and removes builder options that changed in that version, and writes `zoneless: false` on any project it detects as zone-based. The full list of renamed and removed options is in the [migration guide](https://github.com/just-jeb/angular-builders/blob/master/MIGRATION.MD).

Crossing v22 runs a second migration that touches nothing on disk. It only warns: ts-jest's `isolatedModules` now defaults to `true` (it lists any `const enum` in your source that this breaks), config loading now goes through jiti, and projects with a non-empty `root` write coverage under `<projectRoot>/coverage`.

`@angular-builders/jest@22` peer-depends on Angular 22, so your project needs to be on Angular 22 before this update applies. The migrations above run in one pass; getting your project to Angular 22 is a separate step this command doesn't run.

## Builder options

- `config` - path to jest config file or a Jest configuration object, relative to _project root_ (or src/ directory in case of non-project app), defaults to `jest.config.js`. Other extensions are also supported. The Jest configuration might be written in TypeScript, but you should explicitly specify the path to the `jest.config.ts`. The configuration is merged on top of the default configuration, so there is no need to specify the whole jest configuration in this file. Just specify the _changes_ you'd like to make to the default configuration.

  You can also provide configuration directly as an object:

  ```json
  "options": {
    "config": {
      "testTimeout": 10000,
      "verbose": true
    }
  }
  ```

  The way the configurations are merged is as following:
  1.  Take the [default configuration](https://github.com/just-jeb/angular-builders/blob/master/packages/jest/src/jest-config/default-config.ts) from the library
  2.  Add on top of it default project specific config (that is dynamic due to different root directories). Used to scope single project test runs.
  3.  Add on top of it _package.json_ jest config if exists (for **all** projects)
      **or**
      _jest.config.js_ from workspace root directory if exists

      > **⚠️ Note on the `projects` field:** The builder acts as the Jest orchestrator via Angular CLI's project system. If your root `jest.config.js` (or `package.json` jest config) contains a `projects` field (used for running Jest standalone across a monorepo), the builder will merge it in and Jest will run **all** sub-projects instead of just the targeted Angular project — resulting in duplicated or unexpected test runs.
      >
      > If you use both `ng test` (via the builder) and `jest` directly (standalone), keep the `projects` field out of the root config and use a separate config file for standalone runs:
      >
      > **`jest.config.js`** — used by the Angular builder (no `projects` field):
      >
      > ```js
      > module.exports = {
      >   // shared options: transform, moduleNameMapper, coverageThreshold, etc.
      > };
      > ```
      >
      > **`jest.projects.config.js`** — used for standalone Jest CLI runs:
      >
      > ```js
      > const baseConfig = require('./jest.config');
      > module.exports = {
      >   ...baseConfig,
      >   projects: ['<rootDir>/apps/*', '<rootDir>/libs/*'],
      > };
      > ```
      >
      > Then run standalone Jest with `jest --config jest.projects.config.js`.

  4.  Add on top of it project specific config if it is specified inside _angular.json_
      **or**
      _jest.config.js_ from project directory (or src/ directory in case of non-project app) if exists.

  Thus, if you don't provide `config` in options, and you'd like to customize the configuration of a single project in your workspace, you only have to add _jest.config.js_ in this project's root directory and specify the configuration delta in this file.
  Or, if you'd like the same custom configuration to be applied to all the projects in the workspace, you just specify it in _package.json_. Another option in such a case is creating a single config file in the workspace root and specifying it in _angular.json_ for each project.

- `tsConfig` - path to tsconfig file. If the path is relative then it is evaluated relative to the _project root_. Defaults to `tsconfig.spec.json` that is located in _project root_.

- `zoneless` - boolean (default: `true`).
  - `true` (default): For Angular 21+ applications using zoneless change detection (the new Angular default)
  - `false`: For applications that rely on zone.js automatic change detection

  **BREAKING CHANGE in v21:** Previous versions always used zone.js. If your app uses zone.js change detection, set `zoneless: false`:

  ```json
  "options": {
    "zoneless": false
  }
  ```

  `ng update @angular-builders/jest` sets this automatically on any project it detects as zone-based, so most workspaces updating from v20 never need the manual edit above.

- `globalMocks` - array (default: `["matchMedia"]`).
  Only `matchMedia` is supported as jsdom still doesn't implement `window.matchMedia`.

  **BREAKING CHANGE in v21:** The `styleTransform`, `getComputedStyle`, and `doctype` mocks have been removed as Jest 30's jsdom now supports these natively. The `ng update` migration strips these entries out of any test target that still references them.

  If you need custom browser API mocks, add your own setup file via `setupFilesAfterEnv` in your jest config.

- `[jest-cli-option]` - any option from [Jest CLI options](https://jestjs.io/docs/en/cli.html). For example, to run unit tests without caching and with `junit-reporter` use:

  ```json
  "options": {
    "no-cache": true,
    "reporters": "jest-junit"
  }
  ```

  These options can also be provided directly to `ng test` command. For example, to run a single test from this suite:

  ```js
  describe('My cool suite', () => {
    it('Should do one thing', () => {
      // do something...
    });

    it('Should do another thing', () => {
      // do something...
    });
  });
  ```

  Use the following command: `ng test --test-name-pattern="My cool suite Should do one thing"`

  **Notice** that for array-like arguments you should use `,` delimiter instead of space delimiter. These are limitations of Angular CLI.  
  Thus, if you want to provide multiple arguments to `find-related-tests` option you should be passing it like this:

  ```sh
  $ ng test --find-related-tests file1,file2
  ```

  **Note:** For multi-project workspaces, paths must be relative to the workspace root, not the project root:

  ```sh
  $ ng test my-lib --find-related-tests projects/my-lib/src/lib/service.ts,projects/my-lib/src/lib/component.ts
  ```

## Migrating existing tests to Jest

Use [this](https://jestjs.io/docs/en/migration-guide) for automatic migration of your Jasmine tests to Jest framework.

## Troubleshooting

Please find below a selection of potential issues you might face when using this builder. Refer to [jest-preset-angular Troubleshooting](https://github.com/thymikee/jest-preset-angular) for `jest-preset-angular` specific issues.

### Unexpected token [import|export|other]

This means that the library you're using doesn't use `commonjs` module format (which `jest` expects to see). You will need to implement the recommendations mentioned in [jest-preset-angular Troubleshooting Guide](https://github.com/thymikee/jest-preset-angular/blob/main/website/docs/guides/troubleshooting.md#unexpected-token-importexportother).

One of the recommendations might require you to [transpile js files through babel-jest](https://github.com/thymikee/jest-preset-angular#transpile-js-files-through-babel-jest).  
In this case make sure you add `allowSyntheticDefaultImports` to the `ts-jest` configuration (see [here](https://github.com/7leads/ngx-cookie-service/issues/39) for an explanation of this setting).

```js
transform: {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      allowSyntheticDefaultImports: true,
    },
  ],
}
```

Your final `jest.config.js` file should look something like this:

```js
const esModules = ['[thir-party-lib]'].join('|');

module.exports = {
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esModules})`],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        allowSyntheticDefaultImports: true,
      },
    ],
    '^.+\\.js$': 'babel-jest',
  },
};
```

### Top-level `await` in test files

Test files are compiled to CommonJS by `ts-jest`/`jest-preset-angular`, and top-level `await` (an `await` at module scope, e.g. `const { AppComponent } = await import('./app.component');` outside of any function) is not valid in CommonJS. You will see:

```
SyntaxError: await is only valid in async functions and the top level bodies of modules
```

Jest's native ES module support that would allow this is still experimental, so the builder does not enable it. Instead, move the dynamic import into an async hook:

```ts
let AppComponent;

beforeAll(async () => {
  ({ AppComponent } = await import('./app.component'));
});
```

## Further reading

- [Running `ng test` with Jest](https://www.justjeb.com/post/angular-cli-ng-test-with-jest) — background from 2021 on switching a workspace from Karma to Jest by hand, published years before the `ng add` schematic existed. Worth reading to see what the schematic now does on your behalf; for setup, follow [Installation](#installation).
