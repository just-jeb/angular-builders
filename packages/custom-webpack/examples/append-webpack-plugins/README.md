
# Example angular-cli-builders project.

## AppendWebpackPlugins

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8 with the [angular-cli-builders](https://github.com/meltedspark/angular-cli-builders) projects to append an example BuildStampPlugin into the webpackConfig. The plugin will inject a simple date stamp into the index.html.

## Steps
1. `ng new append-webpack-plugins`

2. [Update package.json to add angular-cli-builders](package.json#L46)
```
    "angular-cli-builders": "^2.0.0",
    "@angular-devkit/architect": "^0.7.0-rc.3",
    "@angular-devkit/build-angular": "^0.7.0-rc.3",
    "@angular-devkit/core": "^0.7.0-rc.3"
```

3. [Update angular.json configuration changes](angular.json#L14)

4. [Add extra-webpack.config.js with new plugins to merge into the build](extra-webpack.config.js)

5. [Add BuildStampPlugin example plugin](build/BuildStampPlugin.js)

6. `npm run build` Then look at the generated `index.html` for the build stamp:

```
...
<!-- Built on Wed, 25 Jul 2018 22:59:38 GMT -->
</body>
</html>
```
