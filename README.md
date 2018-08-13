# Jest builder for Angular build facade
[![npm version](https://badge.fury.io/js/%40angular-builders%2Fjest.svg)](https://badge.fury.io/js/%40angular-builders%2Fjest)
[![Build Status](https://travis-ci.org/angular-builders/jest.svg?branch=master)](https://travis-ci.org/angular-builders/jest)
![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg)  

Allows running `ng test` with Jest instead of Karma & Jasmine.

## Prerequisits
  - [Angular CLI 6](https://www.npmjs.com/package/@angular/cli)
  - [Jest](https://www.npmjs.com/package/jest)
## Installation

1. Remove Karma related libraries and files:
   ```
     npm remove karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter
	 rm karma.config.js
   ```
2. Install the builder (and `jest` if you still haven't): `npm i -D jest @angular-builders/jest`

## Updating Typescript configurations

Although you run your unit tests with Jest, Protractor (e2e tests) still [has to use Jasmine](https://github.com/angular/protractor/issues/3889).
Due to this fact it's possible that you favorite IDE will get confused with the typings and will propose you Jasmine types in unit tests or Jest types in e2e test.
In order to avoid that kind of problems you have to specify the types explicitly:

1. In _tsconfig.spec.json_ (_src_ directory, used by Jest): 
	```
	"compilerOptions": {
		...
		"module": "commonjs",
		"types": ["jest"]
	} 
	```
	Make sure the module is `commonjs`, otherwise tests will fail at imports.

2. In _tsconfig.json_ (root directory, used by IDE): 
	```
	"compilerOptions": {
		...
		"types": ["jest"]
	} 
	```

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
                               "builder": "@angular-builders/jest:run"
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
 - `[booleanOption]` - any boolean option from [Jest CLI options](https://jestjs.io/docs/en/cli.html). For example, to run unit tests without caching use:
   ```
   "options": {
		"no-cache": true
   }   
   ```
   
## Migrating existing tests to Jest
Use [this](https://jestjs.io/docs/en/migration-guide) for automatic migration of your Jasmine tests to Jest framework.
