// Base schemes from build-angular@17.3.2

import * as path from 'node:path';

module.exports = [
  {
    originalSchemaPath: require.resolve(
      '@angular-devkit/build-angular/src/builders/application/schema.json'
    ),
    schemaExtensionPaths: [path.join(__dirname, 'application/schema.ext.json')],
    newSchemaPath: path.resolve(__dirname, '../dist/application/schema.json'),
  },
  {
    originalSchemaPath: require.resolve(
      '@angular-devkit/build-angular/src/builders/dev-server/schema.json'
    ),
    schemaExtensionPaths: [path.join(__dirname, 'dev-server/schema.ext.json')],
    newSchemaPath: path.resolve(__dirname, '../dist/dev-server/schema.json'),
  },
];
