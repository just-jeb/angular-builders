# Jest builder for Angular
[![npm version](https://badge.fury.io/js/%40angular-builders%2Fjest.svg)](https://badge.fury.io/js/%40angular-builders%2Fjest)
[![Build Status](https://travis-ci.org/angular-builders/jest.svg?branch=master)](https://travis-ci.org/angular-builders/jest)
![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg)  

Jest builder for Angular build facade. Allows running `ng test` with Jest and not Karma & Jasmine.

## Prerequisits
  - [Angular CLI 6](https://www.npmjs.com/package/@angular/cli)
  - [Jest](https://www.npmjs.com/package/jest)
## Installation
1. Remove karma & jasmin related libraries and files:
   ```
     npm remove @types/jasmine @types/jasminewd2 jasmine-spec-reporter karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter
	 rm karma.config.js
   ```
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
