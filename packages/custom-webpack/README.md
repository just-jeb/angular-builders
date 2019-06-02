# Custom webpack [builders](#builders) for Angular build facade

[![npm (tag)](https://img.shields.io/npm/v/@angular-builders/custom-webpack/7.x.x.svg) ![npm](https://img.shields.io/npm/dm/@angular-builders/custom-webpack.svg)](https://www.npmjs.com/package/@angular-builders/custom-webpack)

Allow customizing build configuration without ejecting webpack configuration (`ng eject`)

## This documentation is for version 7, which is compatible with Angular CLI 7 and incompatible with higher versions.
## [Documentation for latest version](https://github.com/meltedspark/angular-builders/tree/master/packages/custom-webpack)

# Prerequisites:

- [Angular CLI 7](https://www.npmjs.com/package/@angular/cli)
- [@angular-devkit/build-angular](https://npmjs.com/package/@angular-devkit/build-angular) >= 0.13.0

# Usage

1. `npm i -D @angular-builders/custom-webpack`
2. In your `angular.json`:

```
"projects": {
    ...
    "[project]": {
         ...
         "architect": {
                ...
                "[architect-target]": {
                          "builder": "@angular-builders/custom-webpack:[browser|server|karma|extract-i18n]"
                          "options": {
                                ...
                          }
```

Where:

- [project] is the name of the project to which you want to add the builder
- [architect-target] is the name of build target you want to run (build, serve, test etc. or any custom target)
- [browser|server|karma|extract-i18n] one of the supported builders - [browser](#Custom-webpack-browser), [server](#Custom-webpack-server), [karma](#Custom-webpack-Karma) or [extract-i18n](#Custom-webpack-extract-i18n)

- If `[architect-target]` is not one of the predefined targets (like build, serve, test etc.) then run it like this:<br>
  `ng run [project]:[architect-target]`<br>
  If it is one of the predefined targets, you can run it with `ng [architect-target]`

## For example

- angular.json:

  ```
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
- [@angular-builders/custom-webpack:extract-i18n](#Custom-webpack-Extract-i18n)

## Custom webpack browser

Extended `@angular-devkit/build-angular:browser` builder that allows to specify additional webpack configuration (on top of the existing under the hood). The builder will run the same build as `@angular-devkit/build-angular:browser` does with extra parameters that are specified in the provided webpack configuration.

Builder options:

- All the `@angular-devkit/build-angular:browser` options
- `customWebpackConfig`: [see below](#custom-webpack-config-object)

`angular.json` Example:

```
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

Extended `@angular-devkit/build-angular:server` builder that allows to specify additional webpack configuration (on top of the existing under the hood). The builder will run the same build as `@angular-devkit/build-angular:server` does with extra parameters that are specified in the provided webpack configuration.

Builder options:

- All the `@angular-devkit/build-angular:server` options
- `customWebpackConfig`: [see below](#custom-webpack-config-object)

`angular.json` Example:

```
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

In this example `module.rules` entry from `extra-webpack.config.js` will be prepended to `module.rules` entry from Angular CLI underlying webpack config.<br>
Since loaders are evaluated [from right to left](https://webpack.js.org/concepts/loaders/#configuration) this will effectively mean that the loaders you define in your custom configuration will be applied **after** the loaders defined by Angular CLI.

## Custom webpack Karma

Extended `@angular-devkit/build-angular:karma` builder that allows to specify additional webpack configuration (on top of the existing under the hood). The builder will run the same build as `@angular-devkit/build-angular:karma` does with extra parameters that are specified in the provided webpack configuration.

Builder options:

- All the `@angular-devkit/build-angular:karma` options
- `customWebpackConfig`: [see below](#custom-webpack-config-object)

`angular.json` Example:

```
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

## Custom webpack Extract i18n

The Angular CLI provides tooling to manage [Internationalization & Localization](https://angular.io/guide/i18n) via the command `ng xi18n`. Under the hood this uses a separate builder `@angular-devkit/build-angular:extract-i18n` to extract `i18n` attributes from the source code and generate translation files in various translation file formats (XLIFF 1.2, XLIFF 2 or XML Message Bundle (XMB)). Quite often the out-of-the-box tooling falls short for real world i18n workloads which necessiates augmenting the tooling with a library such as [@ngx-i18nsupport/tooling](https://www.npmjs.com/package/@ngx-i18nsupport/tooling). This type of library provides schematics and architect builders to support a dynamic i18n workflow, primarily adding merge capability to the translation files.

If this library is employed to provide a Custom webpack config these architect and builder targets will fail to observe the custom webpack configuration. Analogous to why one would need to use the [@angular-builders/custom-webpack:karma](#Custom-webpack-Karma) builder to generate a custom webpack build and have the `ng test` function correctly one would need to use the `@angular-builders/custom-webpack:extract-i18n` target to use the Custom webpack configuration and have the translation files generated accordingly.

An example of this is whereby additional loaders/plugins are specificed in the "extra-webpack.config.js", which, when not present would yield a broken build.

The builder will run the same build as `@angular-devkit/build-angular:extract-i18n` does with extra parameters that are specified in the provided webpack configuration.

Builder options:

- All the `@angular-devkit/build-angular:extract-i18n` options
- `customWebpackConfig`: [see below](#custom-webpack-config-object)

`angular.json` Example:

```
{
    "architect": {
        "build": {
            "builder": "@angular-builders/custom-webpack:extract-i18n",
            "options": {
              "browserTarget": "my-cool-angular-app-arch:build",
              "customWebpackConfig": {
                "path": "./extra-webpack.config.js",
                "mergeStrategies": {
                  "module.rules": "append"
                },
                "replaceDuplicatePlugins": true
              }
      }
    }
  }
}
```

Supplemented by the `extra-webpack.config.js` Example:

```
const I18nXlfAnnotateAppVersionPlugin = require('./build/i18n-xlf-annotate-app-version.plugin.js');

/**
 * This is where you define your additional webpack configuration items to be appended to
 * the end of the webpack config.
 */
module.exports = {
  plugins: [
    new I18nXlfAnnotateAppVersionPlugin()
  ]
};
```

In this example our custom Webpack plugin (I18nXlfAnnotateAppVersionPlugin) will be appended to the Angular CLI's underlying webpack config.  When run will attribute the translations `file` node in the xml with the app version contained in the `package.json`.

# Custom webpack config object

This option defines your custom webpack configuration. If not specified at all, plain Angular build will run.<br>
The following properties are available:

- `path`: path to the extra webpack configuration, defaults to `webpack.config.js`. The configuration file can export either an object or a function. If it is an object it shall contain only modifications and additions, you don't have to specify the whole webpack configuration.<br>
  Thus, if you'd like to add some options to `style-loader` (which already there because of default Angular configuration), you only have to specify this part of the loader:

  ```
  {
     test: /\.css$/,
     use: [
       {loader: 'style-loader', options: {...}}
     ]
   }
  ```

  The builder will take care of merging the delta with the existing configuration provided by Angular.<br>
  In more complicated cases you'd probably want to [use a function](#custom-webpack-config-function) instead of an object.

- `mergeStrategies`: webpack config merge strategies, can be `append | prepend | replace` per webpack config entry. Defaults to `append`.

  - `append`: appends the given entry configuration (in custom webpack config) to the existing Angular CLI webpack configuration.
  - `prepend`: prepends the given entry configuration (in custom webpack config) to the existing field configuration (in Angular CLI webpack config). The custom loaders config will be added to the _beginning_ of the existing loaders array.
  - `replace`: replaces the given entry configuration entirely. The custom webpack config will replace the Angular CLI webpack config (for this particular entry). See [webpack-merge](https://github.com/survivejs/webpack-merge) for more info.

- `replaceDuplicatePlugins`: Defaults to `false`. If `true`, the plugins in custom webpack config will replace the corresponding plugins in default Angular CLI webpack configuration. If `false`, the [default behavior](#merging-plugins-configuration) will be applied. **Note that if `true`, this option will override `mergeStrategies` for `plugins` field.**

## Merging plugins configuration:

If in your custom configuration you specify a plugin that is already added by Angular CLI then by default the two instances will be merged.<br>
In case of the conflicts your configuration will override the existing one.<br>
Thus, if you'd like to modify an existing plugin configuration, all you have to do is specify the _delta_ you want to change.<br>
For example, if you'd like to add an additional entry in `excludeChunks` list of `HtmlWebpackPlugin` you only have to specify this single entry:

```javascript
new HtmlWebpackPlugin({
  excludeChunks: ["webworker"]
});
```

Keep in mind though that if there are default values in the plugin's constructor, they would override the corresponding values in the existing instance. So these you have to set explicitly to the same values Angular sets.<br>
You can check out an example for plugins merge in the [unit tests](./src/webpack-config-merger.spec.ts) and in [this](https://github.com/meltedspark/angular-builders/issues/13) issue.

## Custom Webpack config function

If `customWebpackConfig.path` file exports a function, the behaviour of the builder changes : no more automatic merge is applied, instead the function is called with the base Webpack configuration and must return the new configuration.

The function is called with the base config and the builder options as parameters.

In this case, `mergeStrategies` and `replaceDuplicatePlugins` options have no effect.

`custom-webpack.config.js` example :

```javascript
const webpack = require("webpack");
const pkg = require("./package.json");

module.exports = (config, options) => {
  config.plugins.push(
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(pkg.version)
    })
  );

  return config;
};
```

# Further reading

- [Customizing Angular CLI 6 build - an alternative to ng eject](https://medium.com/@meltedspark/customizing-angular-cli-6-build-an-alternative-to-ng-eject-a48304cd3b21)
