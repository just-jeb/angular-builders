# Migration from version 7 to version 8

1. `@angular-builders/dev-server:generic` has been deprecated. Use [`@angular-builders/custom-webpack:dev-server`](https://github.com/meltedspark/angular-builders/tree/master/packages/custom-webpack#Custom-webpack-dev-server) instead.
2. In Angular CLI 8 `index.html` is no longer generated with Webpack during `ng build`. This means if your solution uses Webpack to alter `index.html` it will stop working the moment you upgrade to version 8.  
The only way to alter `index.html` now is having a separate script that runs after the build and makes changes to `dist/index.html`.  
Dev server (`ng serve`) though still uses Webpack so don't rush to throw your custom webpack configuration away. You'll still need it for running `ng serve` during development.  
**UPDATE**: [This](https://github.com/alan-agius4/angular-cli/commit/33ba99e14787f2cd311e6c9448672d691c29ab5c) commit in Angular CLI 8 adds an ability to transform `index.html`. Looking into it in order to incorporate this ability in `custom-webpack` builder.
