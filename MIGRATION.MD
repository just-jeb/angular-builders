# Migration from version 8 to version 9

## All builders
1. `@angular/architect` and `angular/core` are now direct builder dependencies, therefore no need to specify them explicitly in `package.json`

## Jest builder
1. jest-preset-angular version has been updated to 8. If you have any custom Jest configuration, make sure it matches the preset [version](https://github.com/thymikee/jest-preset-angular/releases/tag/v8.0.0).

# Migration from version 7 to version 8

## Custom webpack builder
1. `index.html` is no longer generated with Webpack. This means if your solution uses Webpack to alter `index.html` it will stop working the moment you upgrade to version 8.  
Instead you should use [`indexTransform`](https://github.com/just-jeb/angular-builders/blob/master/packages/custom-webpack/README.md#index-transform) property.

## Dev server builder
1. `@angular-builders/dev-server:generic` has been deprecated. Use [`@angular-builders/custom-webpack:dev-server`](https://github.com/just-jeb/angular-builders/tree/master/packages/custom-webpack#Custom-webpack-dev-server) instead.

## Jest builder
1. Update to Jest 24 if you still haven't.
