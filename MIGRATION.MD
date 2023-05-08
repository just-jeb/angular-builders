# Migration from version 15 to version 16

# Migration from version 14 to version 15

## Custom Webpack builder

- No breaking changes (except for updating to Angular 15)

## Jest builder

- No breaking changes (except for updating to Angular 15)

# Migration from version 13 to version 14

## Custom Webpack builder

- Node 12 is no longer supported

## Jest builder

- Node 12 is no longer supported
- Minimal required version of Jest is 28
- Command line arguments in camelCase are no longer supported, use kebab-case instead
- The default value of `getComputedStyle` global mock is `{}` instead of `{display: 'none', appearance: ['-webkit-appearance']}`
- If you use it with custom configuration, make sure you read [this](https://github.com/thymikee/jest-preset-angular/blob/main/CHANGELOG.md#breaking-changes)

## Bazel builder

- Node 12 is no longer supported

# Migration from version 12 to version 13

## Custom Webpack builder

No breaking changes (except for updating to Angular 13)

## Jest builder

`jest-preset-angular` has been updated to version 11.

- If you use it without custom configuration then no action required.
- If you use it with custom configuration, you might need to [update it](https://thymikee.github.io/jest-preset-angular/docs/next/guides/angular-13+/).

# Migration from version 11 to version 12

## Custom Webpack builder

No breaking changes (except for updating to Angular 12)

## Jest builder (since 12.1.0)

1. Jest 27 is required now
2. `jest-preset-angular` has been updated to version 9, which uses Angular compiler instead of `ts-jest` in order to transform the TS files. Make sure you understand the implications and perform all the necessary changes to your code base as described in `jest-preset-angular` [CHANGELOG](https://github.com/thymikee/jest-preset-angular/blob/master/CHANGELOG.md).

# Migration from version 10 to version 11

## Custom Webpack builder

1. `mergeStrategies` field in `customWebpackConfig` has been deprecated, use `mergeRules` instead as defined [here](https://github.com/survivejs/webpack-merge#mergewithrules).

In order to make this breaking change as backward compatible as possible, the default value of `mergeRules` is the following:

```ts
{
  module: {
    rules: {
      test: "match",
      use: {
        loader: "match",
        options: "merge",
      },
    },
  },
};
```

This is as close as possible to the [`smart` merge strategy](https://github.com/survivejs/webpack-merge/tree/v4.2.2#smart-merging) that was used before, so ideally if you didn't use `mergeStrategies` then your configuration should work just as it worked before.  
Otherwise you'll have to adjust the `mergeRules` in accordance with your needs.  
If you don't want to invest time in learning how the `mergeRules` work or you have a complicated use case then consider using [Custom Webpack Config Function](./packages/custom-webpack#custom-webpack-config-function). This way you'll have full control over the configuration without relying on any merging mechanism.

# Migration from version 9 to version 10

## Jest builder

1. Update to Jest 26 if you still haven't.

# Migration from version 8 to version 9

## All builders

1. `@angular/architect` and `angular/core` are now direct builder dependencies, therefore no need to specify them explicitly in `package.json`

## Jest builder

1. jest-preset-angular version has been updated to 8. If you have any custom Jest configuration, make sure it matches the preset [version](https://github.com/thymikee/jest-preset-angular/releases/tag/v8.0.0).

2. If you're using Ivy (enabled by default in version 9) make sure you run `ngcc` in a `postinstall` hook. For more details refer to [this](https://github.com/just-jeb/angular-builders/issues/679#issuecomment-587525674) issue.

# Migration from version 7 to version 8

## Custom Webpack builder

1. `index.html` is no longer generated with Webpack. This means if your solution uses Webpack to alter `index.html` it will stop working the moment you upgrade to version 8.  
   Instead you should use [`indexTransform`](https://github.com/just-jeb/angular-builders/blob/master/packages/custom-webpack/README.md#index-transform) property.

## Dev-server builder

1. `@angular-builders/dev-server:generic` has been deprecated. Use [`@angular-builders/custom-webpack:dev-server`](https://github.com/just-jeb/angular-builders/tree/master/packages/custom-webpack#Custom-webpack-dev-server) instead.

## Jest builder

1. Update to Jest 24 if you still haven't.
