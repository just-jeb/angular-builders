# @angular-builders/custom-webpack Schematics

Automated installation and migration for custom webpack configurations.

## Installation

```bash
ng add @angular-builders/custom-webpack
```

## What it does

1. Installs @angular-builders/custom-webpack
2. Sets up custom webpack builder in angular.json
3. Creates webpack.config.js template (optional)

## Usage After Installation

```bash
# Build with custom webpack
ng build --configuration=custom

# Serve with custom webpack
ng serve --configuration=custom
```

## Configuration

Create or edit `webpack.config.js`:

```javascript
module.exports = (config) => {
  // Customize webpack config
  config.module.rules.push({
    test: /\.custom$/,
    use: 'custom-loader'
  });
  return config;
};
```

Then reference it in angular.json:

```json
{
  "build": {
    "builder": "@angular-builders/custom-webpack:browser",
    "options": {
      "customWebpackConfig": {
        "path": "./webpack.config.js"
      }
    }
  }
}
```

## See Also

- [@angular-builders/custom-webpack Documentation](../../README.md)
- [Webpack Configuration Guide](https://webpack.js.org/configuration)
