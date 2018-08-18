# MultipleApps

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.4.

Then all karma configurations and dependencies were removed. Only the jest builder was added in the [angular.json](./angular.json) (see main [README.md](../../README.md))

## Structure

```
├── projects
│   ├── my-first-app
│   │   ├── ...
│   ├── my-first-app-e2e
│   │   ├── ...
│   ├── my-second-app
│   │   ├── ...
│   ├── my-second-app-e2e
│   │   ├── ...
│   └── my-shared-library
│       ├── ...
├── angular.json
└── ...
```

## Development server

### my-first-app

Run `ng serve my-first-app` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### my-second-app

Run `ng serve my-second-app` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

### my-first-app

Run `ng build my-first-app` to build the project. The build artifacts will be stored in the `dist/my-first-app` directory. Use the `--prod` flag for a production build.

### my-second-app

Run `ng build my-second-app` to build the project. The build artifacts will be stored in the `dist/my-second-app` directory. Use the `--prod` flag for a production build.

### my-shared-library

Run `ng build my-shared-library` to build the project. The build artifacts will be stored in the `dist/my-shared-library` directory. Use the `--prod` flag for a production build.

## Running unit tests

### All

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).

### my-first-app

Run `ng test my-first-app` to execute the unit tests via [Jest](https://jestjs.io/).

### my-second-app

Run `ng test my-second-app` to execute the unit tests via [Jest](https://jestjs.io/).

### my-shared-library

Run `ng test my-shared-library` to execute the unit tests via [Jest](https://jestjs.io/).

## Running end-to-end tests

### All

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### my-first-app-e2e

Run `ng e2e my-first-app-e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### my-second-app-e2e

Run `ng e2e my-second-app-e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
