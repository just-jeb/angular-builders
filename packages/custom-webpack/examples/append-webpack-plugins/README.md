# AppendWebpackPlugins

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.0.0.

## Steps
1. `ng new append-webpack-plugins`

2. [Update package.json to add @angular-builders/custom-webpack and @angular-builders/dev-server](package.json#L28)

3. [Update angular.json configuration changes](angular.json#L14)

4. [Add extra-webpack.config.js with new plugins to merge into the build](extra-webpack.config.js)

5. [Add HelloWorldPlugin example plugin](build/hello-world.plugin.js)

6. `npm run build` Then look at the generated `index.html` for the Hello World div:

```
...
<div>Hello world</div>
</body>
</html>
```
