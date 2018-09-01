module.exports = [
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/dev-server/schema.json',
    schemaExtensionPaths: [`${__dirname}/generic/schema.ext.json`],
    newSchemaPath: `${__dirname}/generic/schema.json`
  }
];