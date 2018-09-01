# custom-webpack [![npm version](https://badge.fury.io/js/%40angular-builders%2Fcustom-webpack.svg)](https://badge.fury.io/js/%40angular-builders%2Fcustom-webpack)
Custom webpack [builders](#builders) for Angular build facade.  
Allow customizing build configuration without ejecting webpack configuration (`ng eject`)

# Prerequisites:
 - [Angular CLI 6](https://www.npmjs.com/package/@angular/cli)
 - [@angular-devkit/architect](https://www.npmjs.com/package/@angular-devkit/architect) >= 0.7.0
 - [@angular-devkit/build-angular](https://npmjs.com/package/@angular-devkit/build-angular) >= 0.7.0
 - [@angular-devkit/core](https://npmjs.com/package/@angular-devkit/core) >= 0.7.0


# Usage

 1. ```npm i -D @angular-builders/custom-webpack```
 2. In your `angular.json`:
     ```
     "projects": {
         ...
         "[project]": {
              ...
              "architect": {
                     ...
                     "[architect-target]": {
                               "builder": "@angular-builders/custom-webpack:[browser|server]"
                               "options": {
                                     ...
                               }
      ```
    Where:
    - [project] is the name of the project to which you want to add the builder
    - [architect-target] is the name of build target you want to run (build, serve, test etc. or any custom target)
    - [browser|server] one of the supported builders - [browser](#Custom-webpack-browser) or [server](#Custom-webpack-server)
 3. If `[architect-target]` is not one of the predefined targets (like build, serve etc.) then run it like this:  
    `ng run [project]:[architect-target]`  
    If it is one of the predefined targets, you can run it by `ng [architect-target]`

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

## Custom webpack browser

Extended `@angular-devkit/build-angular:browser` builder that allows to specify additional webpack configuration (on top of the existing under the hood).
The builder will run the same build as `@angular-devkit/build-angular:browser` does with extra parameters that are specified in the provided webpack configuration.

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

## Custom webpack server

Extended `@angular-devkit/build-angular:server` builder that allows to specify additional webpack configuration (on top of the existing under the hood).
The builder will run the same build as `@angular-devkit/build-angular:server` does with extra parameters that are specified in the provided webpack configuration.

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

# Custom webpack config object
This object defines your custom webpack configuration. It is defined by the following properties:
 - `path`: path to the extra webpack configuration, defaults to `webpack.config.js`.
    Notice that this configuration shall contain only modifications and additions, you don't have to specify the whole webpack confgiuration.  
    Thus, if you'd like to add some options to `style-loader` (which already there because of default Angular configuration), you only have to specify this part of the loader:  
    
        {
          test: /\.css$/,
          use: [
            {loader: 'style-loader', options: {...}}
          ]
        }
    
    The builder will take care of merging the delta with the existing configuration provided by Angular.  

    The only exception is `plugins` that are not merged by default. If you want to add some functionality to `AngularCompilerPlugin` you have to specify the whole configuration for this plugin (including your modifications) and use `replaceDuplicatePlugins` option (see below).  
    There is an [ongoing work](https://github.com/meltedspark/angular-builders/issues/30) to fix this behavior.
 - `mergeStrategies`: webpack config merge strategies, can be `append | prepend | replace` per webpack config entry. Defaults to `append`.
    - `append`: appends the given entry configuration (in custom webpack config) to the existing Angular CLI webpack configuration.
    - `prepend`: prepends the given entry configuration (in custom webpack config) to the existing field configuration (in Angular CLI webpack config). The custom loaders config will be added to the _beginning_ of the existing loaders array.
    - `replace`: replaces the given entry configuration entirely. The custom webpack config will replace the Angular CLI webpack config (for this particular entry).
      See [webpack-merge](https://github.com/survivejs/webpack-merge) for more info.
 - `replaceDuplicatePlugins`: Defaults to `false`. If `true`, the plugins in custom webpack config will replace the corresponding plugins in default Angular CLI webpack configuration.
# Further reading

 - [Customizing Angular CLI 6 build  -  an alternative to ng eject](https://medium.com/@meltedspark/customizing-angular-cli-6-build-an-alternative-to-ng-eject-a48304cd3b21) 
