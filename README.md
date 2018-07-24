# angular-cli-builders [![npm version](https://badge.fury.io/js/angular-cli-builders.svg)](https://badge.fury.io/js/angular-cli-builders) [![Build Status](https://travis-ci.org/meltedspark/angular-cli-builders.svg?branch=master)](https://travis-ci.org/meltedspark/angular-cli-builders) [![Greenkeeper badge](https://badges.greenkeeper.io/meltedspark/angular-cli-builders.svg)](https://greenkeeper.io/)
A set of additional builders for angular-cli

# Prerequisites:
 - [Angular CLI 6](https://www.npmjs.com/package/@angular/cli)
 - [@angular-devkit/architect](https://www.npmjs.com/package/@angular-devkit/architect) >= 0.7.0-rc.0
 - [@angular-devkit/build-angular](https://npmjs.com/package/@angular-devkit/build-angular) >= 0.7.0-rc.0

# Usage

 1. ```npm i -D angular-cli-builders```
 2. In your `angular.json`:  
     ```
     ...
     "architect": {
            ...
            "[architect-target]": {
                      "builder": "angular-cli-builders:[name-of-builder]"
                      "options": {
                            ...
                      }
      ```
    Where:
    - [architect-target] is the name of build target you want to run (build, serve, test etc.)
    - [name-of-builder] one of the supported builders (specified below)
 3. `ng [architect-target]`
 
 ## For example
 
  - angular.json:
    ```
    "architect": {
        ...
        "build": {
                  "builder": "angular-builders:custom-webpack-browser"
                  "options": {
                        ...
                  }
    ```
  - Run the build: `ng build`

# Builders

## custom-webpack-browser

Extended `@angular-devkit/build-angular:browser` builder that allows to specify additional webpack configuration (on top of the existing under the hood).   
The builder will run the same build as `@angular-devkit/build-angular:browser` does with extra parameters that are specified in the provided webpack configuration.

Options:
 - All the `@angular-devkit/build-angular:browser` options
 - `customWebpackConfig`: configuration object with the following properties:
    - `path`: path to the extra webpack configuration, defaults to `webpack.config.js`
    - `mergeStrategies`: webpack config merge strategy, strategies can be `append | prepend | replace` per webpack config entry. Defaults to append
      - `append`: appends the given field configuration (in custom webpack config) to the existing Angular CLI webpack configuration
      - `prepend`: prepends the given field configuration (in custom webpack config) to the existing field configuration (in Angular CLI webpack config). The custom loaders config will be added to the _beginning_ of the existing loaders array
      - `replace`: replaces the configuration entirely. The custom webpack config will replace the Angular CLI webpack config
      See [webpack-merge](https://github.com/survivejs/webpack-merge) for more info
    - `replaceDuplicatePlugins`: Defaults to `false`. If true, the plugins in your custom webpack config will replace the corresponding plugins in default Angular CLI webpack configuration

`angular.json` Example: 
```
"architect": {
    ...
    "build": {
              "builder": "angular-cli-builders:custom-webpack-browser"
              "options": {
                     "customWebpackConfig": {
                        path: "./extra-webpack.config.js",
                        mergeStrategies: { "externals": "prepend" },
                     }
                     "outputPath": "dist/my-cool-client",
                     "index": "src/index.html",
                     "main": "src/main.ts",
                     "polyfills": "src/polyfills.ts",
                     "tsConfig": "src/tsconfig.app.json"
              }
```
In this example `externals` entry from `extra-webpack.config.js` will be prepended to `externals` entry from Angular CLI underlying webpack config. 

## custom-webpack-server

Extended `@angular-devkit/build-angular:server` builder that allows to specify additional webpack configuration (on top of the existing under the hood).   
The builder will run the same build as `@angular-devkit/build-angular:server` does with extra parameters that are specified in the provided webpack 
configuration.

Options:
 - All the `@angular-devkit/build-angular:server` options
 - `customWebpackConfig`: configuration object with the following properties:
    - `path`: path to the extra webpack configuration, defaults to `webpack.config.js`
    - `mergeStrategies`: webpack config merge strategy, strategies can be `append | prepend | replace` per webpack config entry. Defaults to append
      - `append`: appends the given field configuration (in custom webpack config) to the existing Angular CLI webpack configuration
      - `prepend`: prepends the given field configuration (in custom webpack config) to the existing field configuration (in Angular CLI webpack config). The custom loaders config will be added to the _beginning_ of the existing loaders array
      - `replace`: replaces the configuration entirely. The custom webpack config will replace the Angular CLI webpack config
      See [webpack-merge](https://github.com/survivejs/webpack-merge) for more info
    - `replaceDuplicatePlugins`: Defaults to `false`. If true, the plugins in your custom webpack config will replace the corresponding plugins in default Angular CLI webpack configuration

`angular.json` Example: 
```
"architect": {
    ...
    "build": {
              "builder": "angular-cli-builders:custom-webpack-server"
              "options": {
                     "customWebpackConfig": {
                        path: "./extra-webpack.config.js",
                        mergeStrategies: { "loaders": "replace" },
                        replaceDuplicatePlugins: true
                     }
                    "outputPath": "dist/my-cool-server",
                    "main": "src/main.server.ts",
                    "tsConfig": "src/tsconfig.server.json"
              }
```

In this example `loaders` entry from Angular CLI webpack config will be _replaced_ with loaders entry from `extra-webpack.config.js`. The plugins from `extra-webpack.config.js` will override the corresponding plugins from Angular CLI webpack config.
