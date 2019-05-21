# Custom webpack [builders](#builders) for Angular build facade
[![npm version](https://img.shields.io/npm/v/@angular-builders/custom-webpack.svg) ![npm](https://img.shields.io/npm/dm/@angular-builders/custom-webpack.svg)](https://www.npmjs.com/package/@angular-builders/custom-webpack)

Allow customizing build configuration without ejecting webpack configuration (`ng eject`)

# Prerequisites:
 - [Angular CLI 6](https://www.npmjs.com/package/@angular/cli)
 - [@angular-devkit/build-angular](https://npmjs.com/package/@angular-devkit/build-angular) >= 0.10.0

# Usage

 1. ```npm i -D @angular-builders/custom-webpack```
 2. In your `angular.json`:
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
 3. If `[architect-target]` is not one of the predefined targets (like build, serve, test etc.) then run it like this:  
    `ng run [project]:[architect-target]`  
    If it is one of the predefined targets, you can run it with `ng [architect-target]`

 ## For example
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

## Custom webpack browser

Extended `@angular-devkit/build-angular:browser` builder that allows to specify additional webpack configuration (on top of the existing under the hood).
The builder will run the same build as `@angular-devkit/build-angular:browser` does with extra parameters that are specified in the provided webpack configuration.

Builder options:
 - All the `@angular-devkit/build-angular:browser` options
 - `customWebpackConfig`: [see below](#custom-webpack-config-object)

`angular.json` Example:
```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-webpack:browser"
    "options": {
      "customWebpackConfig": {
        "path": "./extra-webpack.config.js",
        "mergeStrategies": { "externals": "replace" }
      }
      "outputPath": "dist/my-cool-client",
      "index": "src/index.html",
      "main": "src/main.ts",
      "polyfills": "src/polyfills.ts",
      "tsConfig": "src/tsconfig.app.json"
    }
```
In this example `externals` entry from `extra-webpack.config.js` will replace `externals` entry from Angular CLI underlying webpack config.

## Custom webpack server

Extended `@angular-devkit/build-angular:server` builder that allows to specify additional webpack configuration (on top of the existing under the hood).
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
        "mergeStrategies": { "module.rules": "prepend" },
        "replaceDuplicatePlugins": true
      }
     "outputPath": "dist/my-cool-server",
     "main": "src/main.server.ts",
     "tsConfig": "src/tsconfig.server.json"
    }
```

In this example `module.rules` entry from `extra-webpack.config.js` will be prepended to `module.rules` entry from Angular CLI underlying webpack config.  
Since loaders are evaluated [from right to left](https://webpack.js.org/concepts/loaders/#configuration) this will effectively mean that the loaders you define in your custom configuration will be applied **after** the loaders defined by Angular CLI.

## Custom webpack Karma

Extended `@angular-devkit/build-angular:karma` builder that allows to specify additional webpack configuration (on top of the existing under the hood).
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
      }
     "main": "src/test.ts",
     "polyfills": "src/polyfills.ts",
     "tsConfig": "src/tsconfig.spec.json",
     "karmaConfig": "src/karma.conf.js",
     ...
    }
```

## Custom webpack dev-server
Enhanced `@angular-devkit/build-angular:dev-server` builder that leverages the custom webpack builder to get webpack configuration.  

Unlike the default `@angular-devkit/build-angular:dev-server` it doesn't use `@angular-devkit/build-angular:browser` configuration to run the dev server. Instead it uses `customWebpackConfiguration` from `browserTarget` and runs custom webpack dev server build.  

Thus, if you use `@angular-builders/custom-webpack:dev-server` along with `@angular-builders/custom-webpack:browser`, `ng serve` will run with custom configuration provided in the latter.

### Example
`angular.json`:
```js
"architect": {
  ...
  "build": {
    "builder": "@angular-builders/custom-webpack:browser"
    "options": {
      "customWebpackConfig": {
         path: "./extra-webpack.config.js"
      }
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

# Custom webpack config object
This option defines your custom webpack configuration. If not specified at all, plain Angular build will run.  
The following properties are available:
 - `path`: path to the extra webpack configuration, defaults to `webpack.config.js`.
    The configuration file can export either an object or a function. If it is an object it shall contain only modifications and additions, you don't have to specify the whole webpack configuration.  
    Thus, if you'd like to add some options to `style-loader` (which already there because of default Angular configuration), you only have to specify this part of the loader:  
    ```js
    {
      test: /\.css$/,
      use: [
        {loader: 'style-loader', options: {...}}
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

## Merging plugins configuration:
If in your custom configuration you specify a plugin that is already added by Angular CLI then by default the two instances will be merged.  
In case of the conflicts your configuration will override the existing one.  
Thus, if you'd like to modify an existing plugin configuration, all you have to do is specify the *delta* you want to change.  
For example, if you'd like to add an additional entry in `excludeChunks` list of `HtmlWebpackPlugin` you only have to specify this single entry:

```js
new HtmlWebpackPlugin({
  "excludeChunks": [
    "webworker"
  ]
})
```

Keep in mind though that if there are default values in the plugin's constructor, they would override the corresponding values in the existing instance. So these you have to set explicitly to the same values Angular sets.  
You can check out an example for plugins merge in the [unit tests](./src/webpack-config-merger.spec.ts) and in [this](https://github.com/meltedspark/angular-builders/issues/13) issue.

## Custom Webpack config function

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
      'APP_VERSION': JSON.stringify(pkg.version),
    }),
  );

  return config;
};
```

# Further reading

 - [Customizing Angular CLI 6 build  -  an alternative to ng eject](https://medium.com/@meltedspark/customizing-angular-cli-6-build-an-alternative-to-ng-eject-a48304cd3b21)
