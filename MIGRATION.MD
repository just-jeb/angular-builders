# Migration from version 7 to version 8

## Custom webpack builder
1. `index.html` is no longer generated with Webpack during `ng build`. This means if your solution uses Webpack to alter `index.html` it will stop working the moment you upgrade to version 8.  
Instead there is a transform function that receives `string` and returns `string`. This function was added in this [commit](https://github.com/alan-agius4/angular-cli/commit/33ba99e14787f2cd311e6c9448672d691c29ab5c) but it wasn't part of initial Angular CLI 8 release. As soon as it will be released it will be exposed via custom-webpack builder API.  
In the meanwhile it is suggested to prepare your setup for this change:  
    1. Create a separate file `index-html-transform.js`
    2. Export a function that receives an HTML string and returns the modified HTML string
    3. Wait for the API to be released
    
## Dev server builder
1. `@angular-builders/dev-server:generic` has been deprecated. Use [`@angular-builders/custom-webpack:dev-server`](https://github.com/meltedspark/angular-builders/tree/master/packages/custom-webpack#Custom-webpack-dev-server) instead.

## Jest builder
1. Update to Jest 24 if you still haven't.
