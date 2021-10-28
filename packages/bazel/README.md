# Angular CLI support for Bazel

Provides an Angular CLI Builder, which can execute Bazel when triggered by `ng build`, `ng test`, etc.
See https://angular.io/guide/cli-builder for more info about Builders.

> This package is a replacement for parts of the deprecated @angular/bazel package previously maintained by the Angular team.

This builder assumes you have already created Bazel configurations (WORKSPACE and BUILD files).
There is presently no tooling to generate these automatically that's supported by either Angular team or rules_nodejs maintainers.
See the [`@bazel/create`](https://www.npmjs.com/package/@bazel/create)
package for a quickstart to creating a Bazel workspace, or look at examples in [rules_nodejs].

To use it, you would just install this package (it doesn't hook into `ng add` because it has no schematics):

```sh
$ npm install --save-dev @bazel/angular
```

Then edit your `angular.json` to invoke Bazel. For example, to have `ng build` do `bazel build //:all` you would edit the `architect` block to have:

```json
"architect": {
  "build": {
    "builder": "@bazel/angular:build",
    "options": {
      "targetLabel": "//:all",
      "bazelCommand": "build"
    }
  }
}
```

[rules_nodejs]: https://github.com/bazelbuild/rules_nodejs
