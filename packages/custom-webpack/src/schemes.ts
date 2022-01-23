// Base schemes from build-angular@0.1202.7
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/builders/browser/schema.json',
    schemaExtensionPaths: [`${__dirname}/browser/schema.ext.json`, `${__dirname}/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/browser/schema.json`,
  },
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/builders/server/schema.json',
    schemaExtensionPaths: [`${__dirname}/server/schema.ext.json`, `${__dirname}/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/server/schema.json`,
  },
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/builders/karma/schema.json',
    schemaExtensionPaths: [`${__dirname}/karma/schema.ext.json`, `${__dirname}/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/karma/schema.json`,
  },
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/builders/dev-server/schema.json',
    schemaExtensionPaths: [`${__dirname}/dev-server/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/dev-server/schema.json`,
  },
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/builders/extract-i18n/schema.json',
    schemaExtensionPaths: [`${__dirname}/extract-i18n/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/extract-i18n/schema.json`,
  },
];
