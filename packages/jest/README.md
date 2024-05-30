# Jest builder for Angular build facade

[![npm version](https://img.shields.io/npm/v/@angular-builders/jest.svg) ![npm (tag)](https://img.shields.io/npm/v/@angular-builders/jest/next.svg) ![npm](https://img.shields.io/npm/dm/@angular-builders/jest.svg)](https://www.npmjs.com/package/@angular-builders/jest)

Allows running `ng test` with Jest instead of Karma & Jasmine.  
The builder comes to provide zero configuration setup for Jest while keeping the workspace clear of boilerplate code.

# This documentation is for the latest major version only

## Previous versions

<details>
  <summary>Click to expand</summary>

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

## [Quick guide](https://www.justjeb.com/post/angular-cli-ng-test-with-jest)

## Prerequisites

- [Angular CLI 18](https://www.npmjs.com/package/@angular/cli)
- [Jest 29](https://www.npmjs.com/package/jest)

## Installation

1. Remove Karma related libraries and files:
   ```sh
   $ npm remove karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter
   $ rm ./karma.conf.js ./src/test.ts
   ```
2. Install the builder (and `jest` if you still haven't):
   ```sh
   $ npm i -D jest @types/jest @angular-builders/jest
   ```

## Updating Typescript configurations

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

## Running with Angular CLI

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

## Builder options

- `configPath` - path to jest config file, relative to _project root_ (or src/ directory in case of non-project app), defaults to `jest.config.js`. Other extensions are also supported. The Jest configuration might be written is TypeScript, but you should explicitly specify the path to the `jest.config.ts`. The configuration is merged on top of the default configuration, so there is no need to specify the whole jest configuration in this file. Just specify the _changes_ you'd like to make to the default configuration.
  The way the configurations are merged is as following:

  1.  Take the [default configuration](https://github.com/just-jeb/angular-builders/blob/master/packages/jest/src/jest-config/default-config.ts) from the library
  2.  Add on top of it default project specific config (that is dynamic due to different root directories). Used to scope single project test runs.
  3.  Add on top of it _package.json_ jest config if exists (for **all** projects)
      **or**
      _jest.config.js_ from workspace root directory if exists
  4.  Add on top of it project specific config if it is specified inside _angular.json_
      **or**
      _jest.config.js_ from project directory (or src/ directory in case of non-project app) if exists.

  Thus, if you don't provide `configPath` in options, and you'd like to customize the configuration of a single project in your workspace, you only have to add _jest.config.js_ in this project's root directory and specify the configuration delta in this file.  
  Or, if you'd like the same custom configuration to be applied to all the projects in the workspace, you just specify it in _package.json_. Another option in such a case is creating a single config file in the workspace root and specifying it in _angular.json_ for each project.

- `tsConfig` - path to tsconfig file. If the path is relative then it is evaluated relative to the _project root_. Defaults to `tsconfig.spec.json` that is located in _project root_.
- `globalMocks` - there are 4 global mocks available:
  `["getComputedStyle", "doctype", "styleTransform", "matchMedia"]`.  
  The mocks implementation can be found [here](./src/global-mocks).

  `styleTransform` and `matchMedia` are not implemented in jsdom, therefore these are enabled by default.

  `getComputedStyle` and `doctype` are implemented but do not support 100% of cases.

  If you want to disable/enable one or more of these mocks just pass an updated list in options.  
  For example:

  ```json
  "options": {
    "globalMocks": ["styleTransform", "matchMedia", "getComputedStyle"]
  }
  ```

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

## Migrating existing tests to Jest

Use [this](https://jestjs.io/docs/en/migration-guide) for automatic migration of your Jasmine tests to Jest framework.

## Troubleshooting

Please find below a selection of potential issues you might face when using this builder. Refer to [jest-preset-angular Troubleshooting](https://github.com/thymikee/jest-preset-angular) for `jest-preset-angular` specific issues.

### Unexpected token [import|export|other]

This means that the library you're using doesn't use `commonjs` module format (which `jest` expects to see). You will need to implement the recommendations mentioned in [jest-preset-angular Troubleshooting Guide](https://github.com/thymikee/jest-preset-angular#unexpected-token-importexportother).

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
