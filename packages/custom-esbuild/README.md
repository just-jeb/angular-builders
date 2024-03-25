# Custom ESBuild [builders](#builders) for Angular build facade

[![npm version](https://img.shields.io/npm/v/@angular-builders/custom-esbuild.svg) ![npm (tag)](https://img.shields.io/npm/v/@angular-builders/custom-esbuild/next.svg) ![npm](https://img.shields.io/npm/dm/@angular-builders/custom-esbuild.svg)](https://www.npmjs.com/package/@angular-builders/custom-esbuild)

Allow customizing ESBuild configuration

# Table of Contents

- [Usage](#usage)
  - [For Example](#for-example)
- [Builders](#builders)
  - [Custom ESBuild `application`](#custom-esbuild-application)
    - [Example](#example)
  - [Custom ESBuild `dev-server`](#custom-esbuild-dev-server)
    - [Example](#example)
- [Index Transform](#index-transform)
  - [Example](#example-2)
- [ES Modules (ESM) Support](#es-modules-esm-support)

# This documentation is for the latest major version only

## Previous versions

<details>
  <summary>Click to expand</summary>

- [Version 17](https://github.com/just-jeb/angular-builders/blob/17.x.x/packages/custom-esbuild/README.md)

</details>

## Prerequisites:

- [Angular CLI 17.1](https://www.npmjs.com/package/@angular/cli)

# Usage

1.  `npm i -D @angular-builders/custom-esbuild`
2.  In your `angular.json`:
    ```js
    "projects": {
      ...
      "[project]": {
        ...
        "architect": {
          ...
          "[architect-target]": {
            "builder": "@angular-builders/custom-esbuild:[application|dev-server]",
            "options": {
              ...
            }
    ```
    Where:
    - [project] is the name of the project to which you want to add the builder
    - [architect-target] is the name of build target you want to run (build, serve, test etc. or any custom target)
    - [application|dev-server] one of the supported builders - [application](#Custom-webpack-browser) or [dev-server](#Custom-webpack-extract-i18n)
3.  If `[architect-target]` is not one of the predefined targets (like build, serve, test etc.) then run it like this:  
    `ng run [project]:[architect-target]`  
    If it is one of the predefined targets, you can run it with `ng [architect-target]`

## For Example

- angular.json:
  ```js
  "projects": {
    ...
    "example-app": {
      ...
      "architect": {
        ...
        "build": {
          "builder": "@angular-builders/custom-esbuild:browser",
          "options": {
            ...
          }
  ```
- Run the build: `ng build`

# Builders

- [@angular-builders/custom-esbuild:application](#Custom-esbuild-application)
- [@angular-builders/custom-esbuild:dev-server](#Custom-esbuild-dev-server)

## Custom ESBuild `application`

The `@angular-builders/custom-esbuild:application` builder is an extension of the `@angular-devkit/build-angular:application` builder, allowing the specification of additional properties on top of the existing ones. The custom builder runs the original builder at the end, incorporating extra parameters specified in the extended configuration. It will also perform `index.html` transformations if specified.

Builder options:

- All the `@angular-devkit/build-angular:application` options
- `plugins`
- `indexHtmlTransformer`: [see below](#index-transform)

### Example

`angular.json`:

```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-esbuild:application",
    "options": {
      "plugins": ["./esbuild/plugins.ts", "./esbuild/plugin-2.js"],
      "indexHtmlTransformer": "./esbuild/index-html-transformer.js",
      "outputPath": "dist/my-cool-client",
      "index": "src/index.html",
      "browser": "src/main.ts",
      "polyfills": ["zone.js"],
      "tsConfig": "src/tsconfig.app.json"
    }
```

In the above example, we specify the list of `plugins` that should implement the ESBuild plugin schema. These plugins are custom user plugins and are added to the original ESBuild Angular configuration. Additionally, the `indexHtmlTransformer` property is used to specify the path to the file that exports the function used to modify the `index.html`.

The plugin file can export either a single plugin or a list of plugins:

```ts
// esbuild/plugins.ts
import type { Plugin, PluginBuild } from 'esbuild';

const defineTextPlugin: Plugin = {
  name: 'define-text',
  setup(build: PluginBuild) {
    const options = build.initialOptions;
    options.define.buildText = JSON.stringify('This text is provided during the compilation');
  },
};

export default defineTextPlugin;
```

Or:

```ts
// esbuild/plugins.ts
import type { Plugin, PluginBuild } from 'esbuild';

const defineTextPlugin: Plugin = {
  name: 'define-text',
  setup(build: PluginBuild) {
    const options = build.initialOptions;
    options.define.buildText = JSON.stringify('This text is provided during the compilation');
  },
};

const updateExternalPlugin: Plugin = {
  name: 'update-external',
  setup(build: PluginBuild) {
    const options = build.initialOptions;
    options.external ??= [];
    options.external.push('elysia');
  },
};

export default [defineTextPlugin, updateExternalPlugin];
```

## Custom ESBuild `dev-server`

The `@angular-builders/custom-esbuild:dev-server` is an enhanced version of the `@angular-devkit/build-angular:dev-server` builder that allows the specification of `middlewares` (Vite's `Connect` functions). It also obtains `plugins` and `indexHtmlTransformer` from the `:application` configuration to run the Vite server with all the necessary configuration applied.

### Example

`angular.json`:

```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-esbuild:application",
    "options": {
      "plugins": ["./esbuild/plugin-1.js"]
      ...
    }
  },
  "serve": {
    "builder": "@angular-builders/custom-esbuild:dev-server",
    "options": {
      "middlewares": ["./esbuild/my-middleware.js"],
      "buildTarget": "my-project:build"
    }
  }
```

# Index Transform

Since Angular 8, `index.html` is not generated as part of the build. If you want to modify your `index.html`, you should use the `indexHtmlTransformer` option. `indexHtmlTransformer` is a path (relative to the workspace root) to a `.js` or `.ts` file that exports a transformation function for `index.html`. If `indexHtmlTransformer` is written in TypeScript, the application's `tsConfig` file will be used by `tsnode` for its execution:

```typescript
(indexHtmlContent: string) => string | Promise<string>;
```

or, in other words, the function receives target options and original `index.html` content (generated by Angular CLI) and returns a new content as `string` or `Promise<string>`.

It is useful when you want to transform your `index.html` according to the build options.

## Example

`angular.json`:

```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-esbuild:application",
    "options": {
      "indexHtmlTransformer": "./esbuild/index-html-transformer.js"
      ...
    }
```

`index-html-transformer.js`:

```js
module.exports = indexHtml => {
  const gitSha = process.env.GIT_SHA;
  const i = indexHtml.indexOf('</body>');
  const lastCommitSha = `<p>Last commit SHA: ${gitSha}</p>`;
  return `${indexHtml.slice(0, i)}
            ${lastCommitSha}
            ${indexHtml.slice(i)}`;
};
```

Alternatively, using TypeScript:

```ts
export default (indexHtml: string) => {
  const gitSha = process.env['GIT_SHA'];
  const i = indexHtml.indexOf('</body>');
  const lastCommitSha = `<p>Last commit SHA1: ${gitSha}</p>`;
  return `${indexHtml.slice(0, i)}
            ${lastCommitSha}
            ${indexHtml.slice(i)}`;
};
```

In the example we add a paragraph with build configuration to your `index.html`. It is a very simple example without any asynchronous code but you can also return a `Promise` from this function.

# ES Modules (ESM) Support

Custom ESBuild builder fully supports ESM.

- If your app has `"type": "module"` both `plugin.js` and `index-html-transformer.js` will be treated as ES modules, unless you change their file extension to `.cjs`. In that case they'll be treated as CommonJS Modules. [Example](../../examples/custom-esbuild/sanity-esbuild-app-esm).
- For `"type": "commonjs"` (or unspecified type) both `plugin.js` and `index-html-transformer.js` will be treated as CommonJS modules unless you change their file extension to `.mjs`. In that case they'll be treated as ES Modules. [Example](../../examples/custom-esbuild/sanity-esbuild-app).
- If you want to use TS config in ESM app, you must set the loader to `ts-node/esm` when running `ng build`. Also, in that case `tsconfig.json` for `ts-node` no longer defaults to `tsConfig` from the `application` target - you have to specify it manually via environment variable. [Example](../../examples/custom-esbuild/sanity-esbuild-app-esm/package.json#L9).  
  _Note that tsconfig paths are not supported in TS configs within ESM apps. That is because [tsconfig-paths](https://github.com/dividab/tsconfig-paths) do not support ESM._
