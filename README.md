# Jest builder for Angular

## Prerequisits
  - [Angular CLI 6](https://www.npmjs.com/package/@angular/cli)
## Installation
1. Remove karma & jasmin related libraries and files
2. Install the builder: `npm i -D @angular-builders/jest`
## Running with Angular CLI
  - In your `angular.json`:
     ```
     "projects": {
         ...
         "[your-project]": {
              ...
              "architect": {
                     ...
                     "test": {
                               "builder": "@angular-builders:jest:run"
                               "options": {
                                     ... //see below
                               }
      ```
  - Run the tests: `ng test`  
## Builder options
 - `watch` - whether to run jest in watch mode, defaults to `false`
 - `coverage` - whether to run jest with coverage, defaults to `false`
 - `configPath` - path to jest config file, defaults to `jest.config.js`.  
   If `jest` entry exists in _package.json_, `configPath` will be ignored.  
   If no configuration provided (neither in package.json nor here) the [default configuration](https://github.com/angular-builders/jest/blob/master/src/jest-config/default-config.ts) is taken from the builder.
