module.exports = [
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/browser/schema.json',
    schemaExtensionPaths: ['./browser/schema.ext.json', './schema.ext.json'],
    newSchemaPath: './browser/schema.json'
  },
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/server/schema.json',
    schemaExtensionPaths: ['./server/schema.ext.json', './schema.ext.json'],
    newSchemaPath: './server/schema.json'
  }
];