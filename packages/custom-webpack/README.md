# Custom webpack [builders](#builders) for Angular build facade

[![npm version](https://img.shields.io/npm/v/@angular-builders/custom-webpack.svg) <!--![npm (tag)](https://img.shields.io/npm/v/@angular-builders/custom-webpack/next.svg)--> ![npm](https://img.shields.io/npm/dm/@angular-builders/custom-webpack.svg)](https://www.npmjs.com/package/@angular-builders/custom-webpack)

Allow customizing build configuration without ejecting webpack configuration (`ng eject`)

# This documentation is for version 8 only. Find documentation for version 7 [here](https://github.com/just-jeb/angular-builders/blob/7.x.x/packages/custom-webpack/README.md).

# Prerequisites:

- [Angular CLI 8](https://www.npmjs.com/package/@angular/cli)
- [@angular-devkit/build-angular](https://npmjs.com/package/@angular-devkit/build-angular) >= 0.801.0

# Usage

1.  `npm i -D @angular-builders/custom-webpack`
2.  In your `angular.json`:
    ```js
    "projects": {
      ...
      "[project]": {
        ...
        "architect": {
          ...
          "[architect-target]": {
            "builder": "@angular-builders/custom-webpack:[browser|server|karma|dev-server]"
            "options": {
              ...
            }
    ```
    Where:
    - [project] is the name of the project to which you want to add the builder
    - [architect-target] is the name of build target you want to run (build, serve, test etc. or any custom target)
    - [browser|server|karma|dev-server] one of the supported builders - [browser](#Custom-webpack-browser), [server](#Custom-webpack-server), [karma](#Custom-webpack-Karma) or [dev-server](#Custom-webpack-dev-server)
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
          "builder": "@angular-builders/custom-webpack:browser"
          "options": {
            ...
          }
  ```
- Run the build: `ng build`

# Builders

- [@angular-builders/custom-webpack:browser](#Custom-webpack-browser)
- [@angular-builders/custom-webpack:server](#Custom-webpack-server)
- [@angular-builders/custom-webpack:karma](#Custom-webpack-Karma)
- [@angular-builders/custom-webpack:dev-server](#Custom-webpack-dev-server)

## Custom Webpack `browser`

Extended `@angular-devkit/build-angular:browser` builder that allows to specify additional webpack configuration (on top of the existing under the hood) and `index.html` tranformations.
The builder will run the same build as `@angular-devkit/build-angular:browser` does with extra parameters that are specified in the provided webpack configuration. It will also run transformation on `index.html` if specified.

Builder options:

- All the `@angular-devkit/build-angular:browser` options
- `customWebpackConfig`: [see below](#custom-webpack-config-object)
- `indexTransform`: [see below](#index-transform)

`angular.json` Example:

```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-webpack:browser"
    "options": {
      "customWebpackConfig": {
        "path": "./extra-webpack.config.js",
        "mergeStrategies": {
          "externals": "replace"
        }
      },
      "indexTransform": "./index-html-transform.js",
      "outputPath": "dist/my-cool-client",
      "index": "src/index.html",
      "main": "src/main.ts",
      "polyfills": "src/polyfills.ts",
      "tsConfig": "src/tsconfig.app.json"
    }
```

In this example `externals` entry from `extra-webpack.config.js` will replace `externals` entry from Angular CLI underlying webpack config while all the rest will be appended. In addition `index.html` will be modified by the function exported from `./index-html-transform.js`.

## Custom Webpack `dev-server`

Enhanced `@angular-devkit/build-angular:dev-server` builder that leverages the custom webpack builder to get webpack configuration.

Unlike the default `@angular-devkit/build-angular:dev-server` it doesn't use `@angular-devkit/build-angular:browser` configuration to run the dev server. Instead it uses `customWebpackConfiguration` from `browserTarget` and runs custom webpack dev server build.

Thus, if you use `@angular-builders/custom-webpack:dev-server` along with `@angular-builders/custom-webpack:browser`, `ng serve` will run with custom configuration provided in the latter.

### Example

`angular.json`:

```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-webpack:browser",
    "options": {
      "customWebpackConfig": {
         "path": "./extra-webpack.config.js"
      },
      ...
    }
  },
  "serve": {
    "builder": "@angular-builders/custom-webpack:dev-server",
    "options": {
      "browserTarget": "my-project:build"
    }
  }
```

In this example `dev-server` will use `custom-webpack:browser` builder, hence modified webpack config, when invoking the serve target.

## Custom Webpack `server`

Extended `@angular-devkit/build-angular:server` builder that allows to specify additional webpack configuration (on top of the existing under the hood) and `index.html` tranformations.
The builder will run the same build as `@angular-devkit/build-angular:server` does with extra parameters that are specified in the provided webpack configuration.

Builder options:

- All the `@angular-devkit/build-angular:server` options
- `customWebpackConfig`: [see below](#custom-webpack-config-object)

`angular.json` Example:

```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-webpack:server"
    "options": {
      "customWebpackConfig": {
        "path": "./extra-webpack.config.js",
        "mergeStrategies": {
          "module.rules": "prepend"
        },
        "replaceDuplicatePlugins": true
      },
      "outputPath": "dist/my-cool-server",
      "main": "src/main.server.ts",
      "tsConfig": "src/tsconfig.server.json"
    }
```

In this example `module.rules` entry from `extra-webpack.config.js` will be prepended to `module.rules` entry from Angular CLI underlying webpack config while all the rest will be appended.
Since loaders are evaluated [from right to left](https://webpack.js.org/concepts/loaders/#configuration) this will effectively mean that the loaders you define in your custom configuration will be applied **after** the loaders defined by Angular CLI.

## Custom Webpack `karma`

Extended `@angular-devkit/build-angular:karma` builder that allows to specify additional webpack configuration (on top of the existing under the hood) and `index.html` tranformations.
The builder will run the same build as `@angular-devkit/build-angular:karma` does with extra parameters that are specified in the provided webpack configuration.

Builder options:

- All the `@angular-devkit/build-angular:karma` options
- `customWebpackConfig`: [see below](#custom-webpack-config-object)

`angular.json` Example:

```js
"architect": {
  ...
  "test": {
    "builder": "@angular-builders/custom-webpack:karma"
    "options": {
      "customWebpackConfig": {
        "path": "./extra-webpack.config.js"
      },
      "main": "src/test.ts",
      "polyfills": "src/polyfills.ts",
      "tsConfig": "src/tsconfig.spec.json",
      "karmaConfig": "src/karma.conf.js",
    }
```

# Custom Webpack Config Object

This option defines your custom webpack configuration. If not specified at all, plain Angular build will run.  
The following properties are available:

- `path`: path to the extra webpack configuration, defaults to `webpack.config.js`.
  The configuration file can export either an object or a function. If it is an object it shall contain only modifications and additions, you don't have to specify the whole webpack configuration.  
   Thus, if you'd like to add some options to `style-loader` (which already there because of default Angular configuration), you only have to specify this part of the loader:
  ```js
  {
    test: /\.css$/,
    use: [
      {
        loader: 'style-loader',
        options: {
          // `style-loader` options here...
        }
      }
    ]
  }
  ```
  The builder will take care of merging the delta with the existing configuration provided by Angular.  
   In more complicated cases you'd probably want to [use a function](#custom-webpack-config-function) instead of an object.
- `mergeStrategies`: webpack config merge strategies, can be `append | prepend | replace` per webpack config entry. Defaults to `append`.
  - `append`: appends the given entry configuration (in custom webpack config) to the existing Angular CLI webpack configuration.
  - `prepend`: prepends the given entry configuration (in custom webpack config) to the existing field configuration (in Angular CLI webpack config). The custom loaders config will be added to the _beginning_ of the existing loaders array.
  - `replace`: replaces the given entry configuration entirely. The custom webpack config will replace the Angular CLI webpack config (for this particular entry).
    See [webpack-merge](https://github.com/survivejs/webpack-merge) for more info.
- `replaceDuplicatePlugins`: Defaults to `false`. If `true`, the plugins in custom webpack config will replace the corresponding plugins in default Angular CLI webpack configuration. If `false`, the [default behavior](#merging-plugins-configuration) will be applied.
  **Note that if `true`, this option will override `mergeStrategies` for `plugins` field.**

Webpack configuration can be also written in TypeScript. Given the following example:

```ts
// extra-webpack.config.ts
import * as webpack from 'webpack';

export default {
  output: {
    library: 'shop',
    libraryTarget: 'umd',
  },
} as webpack.Configuration;
```

Do not forget to specify the correct path to this file:

```js
"customWebpackConfig": {
  "path": "./extra-webpack.config.ts"
},
```

## Merging Plugins Configuration:

If in your custom configuration you specify a plugin that is already added by Angular CLI then by default the two instances will be merged.  
In case of the conflicts your configuration will override the existing one.  
Thus, if you'd like to modify an existing plugin configuration, all you have to do is specify the _delta_ you want to change.  
For example, if you'd like to allow cyclic dependencies that include dynamic imports you only have to specify this single entry:

```js
module.exports = {
  plugins: [
    new CircularDependencyPlugin({
      allowAsyncCycles: true,
    }),
  ],
};
```

Keep in mind though that if there are default values in the plugin's constructor, they would override the corresponding values in the existing instance. So these you have to set explicitly to the same values Angular sets.  
You can check out an example for plugins merge in the [unit tests](./src/webpack-config-merger.spec.ts) and in [this](https://github.com/just-jeb/angular-builders/issues/13) issue.

## Custom Webpack Promisified Config

Webpack config can also export a `Promise` object that resolves custom config. Given the following example:

```js
// extra-webpack.config.js
const fs = require('fs');
const util = require('util');
const webpack = require('webpack');

const readFile = util.promisify(fs.readFile);

module.exports = readFile('./LICENSE', {
  encoding: 'utf-8',
}).then(license => ({
  plugins: [new webpack.BannerPlugin(license)],
}));
```

In this case, the behavior will be the same as when exporting a plain object — the resolved configuration will be merged with the base one.

## Custom Webpack Config Function

If `customWebpackConfig.path` file exports a function, the behaviour of the builder changes : no more automatic merge is applied, instead the function
is called with the base Webpack configuration and must return the new configuration.

The function is called with the base config and the builder options as parameters.

In this case, `mergeStrategies` and `replaceDuplicatePlugins` options have no effect.

`custom-webpack.config.js` example :

```js
const webpack = require('webpack');
const pkg = require('./package.json');

module.exports = (config, options) => {
  config.plugins.push(
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(pkg.version),
    })
  );

  return config;
};
```

Alternatively, using TypeScript:

```ts
import { CustomWebpackBrowserSchema } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';
import * as pkg from './package.json';

export default (config: webpack.Configuration, options: CustomWebpackBrowserSchema) => {
  config.plugins.push(
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(pkg.version),
    })
  );

  return config;
};
```

It's also possible to export an asynchronous factory (factory that returns a `Promise` object). Let's look at the following example:

```js
// extra-webpack.config.js
const axios = require('axios');
const webpack = require('webpack');

async function getPortalVersion() {
  const response = await axios.get('http://portal.com/version');
  return response.data.version;
}

module.exports = async config => {
  const version = await getPortalVersion();

  config.plugins.push(
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(version),
    })
  );

  return config;
};
```

# Index Transform

### Important:

**_Requires `@angular-devkit/build-angular@0.801` and `@angular-builders/custom-webpack@8.1.0`._**

Since Angular 8 `index.html` is not generated as part of the Webpack build. If you want to modify your `index.html` you should use `indexTransform` option.  
`indexTransform` is a path (relative to workspace root) to a `.js` file that exports transformation function for `index.html`.  
Function signature is as following:

```typescript
(options: TargetOptions, indexHtmlContent: string) => string|Promise<string>;
```

or, in other words, the function receives target options and original `index.html` content (generated by Angular CLI) and returns a new content as `string` or `Promise`.  
`TargetOptions` follows `target` definition from [this](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/architect/src/input-schema.json) schema and looks like this:

```typescript
export interface Target {
  configuration?: string;
  project: string;
  target: string;
}
```

It is useful when you want to transform your `index.html` according to the build options.

## Example

`angular.json`:

```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-webpack:browser"
    "options": {
      "indexTransform": "./index-html-transform.js"
      ...
    }
```

`index-html-transform.js`:

```js
module.exports = (targetOptions, indexHtml) => {
  const i = indexHtml.indexOf('</body>');
  const config = `<p>Configuration: ${targetOptions.configuration}</p>`;
  return `${indexHtml.slice(0, i)}
            ${config}
            ${indexHtml.slice(i)}`;
};
```

In the example we add a paragraph with build configuration to your `index.html`. It is a very simple example without any asynchronous code but you can also return a `Promise` from this function.

Full example [here](https://github.com/just-jeb/angular-builders/tree/master/packages/custom-webpack/examples/full-cycle-app).

# Further Reading

- [Customizing Angular CLI 6 build  -  an alternative to ng eject](https://medium.com/@just-jeb/customizing-angular-cli-6-build-an-alternative-to-ng-eject-a48304cd3b21)
