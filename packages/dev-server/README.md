# Dev server [builders](#builders) for Angular build facade
[![npm version](https://img.shields.io/npm/v/@angular-builders/dev-server/7.x.x.svg) ![npm](https://img.shields.io/npm/dm/@angular-builders/dev-server.svg)](https://www.npmjs.com/package/@angular-builders/dev-server)

## This documentation is for version 7, which is compatible with Angular CLI 7 and incompatible with higher versions.
## [Documentation for latest version](https://github.com/meltedspark/angular-builders/tree/master/packages/custom-webpack/#Custom-webpack-dev-server)

# Prerequisites:
 - [Angular CLI 7](https://www.npmjs.com/package/@angular/cli)
 - [@angular-devkit/build-angular](https://npmjs.com/package/@angular-devkit/build-angular) >= 0.13.0

# Builders
 - [@angular-builders/dev-server:generic](#Dev-server-generic)

## Dev server generic
Enhanced `@angular-devkit/build-angular:dev-server` builder that leverages the custom webpack builder to get webpack configuration.  

Unlike the default `@angular-devkit/build-angular:dev-server` it doesn't use  `@angular-devkit/build-angular:browser` configuration to run the dev server.  
Instead it uses a builder that is specified in `browserTarget` _as long as it provides `buildWebpackConfig` method_.  

Thus, if you use `@angular-builders/dev-server:generic` along with `@angular-builders/custom-webpack:browser`, `ng serve` will run with custom configuration provided in the latter.

### Usage
 1. ```npm i -D @angular-builders/dev-server```
 2. In your `angular.json`:
     ```
     "projects": {
         ...
         "[project]": {
              ...
              "architect": {
                     ...
                     "[architect-target]": {
                               "builder": "@angular-builders/dev-server:generic"
                               "options": {
                                     ...
                               }
      ```
    Where:
    - [project] is the name of the project to which you want to add the builder
    - [architect-target] is the name of build target you want to run (build, serve, test etc. or any custom target)
 3. If `[architect-target]` is not one of the predefined targets (like build, serve etc.) then run it like this:  
    `ng run [project]:[architect-target]`  
    If it is one of the predefined targets, you can run it by `ng [architect-target]`

### Example
`angular.json`:
```
"architect": {
    ...
    "build": {
        "builder": "@angular-builders/custom-webpack:browser"
        "options": {
                     "customWebpackConfig": {
                        path: "./extra-webpack.config.js"
                     }
            ...
        },
    "serve": {
        "builder": "@angular-builders/dev-server:generic",
        "options": {
            "browserTarget": "my-project:build"
        }
    }
```

In this example `dev-server` will use `custom-webpack:browser` builder, hence modified webpack config, when invoking the serve target.

# Further reading

 - [Customizing Angular CLI 6 build  -  an alternative to ng eject](https://medium.com/@meltedspark/customizing-angular-cli-6-build-an-alternative-to-ng-eject-a48304cd3b21) 
