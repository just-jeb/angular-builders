// Base schemes from @angular/build@20.0.0
module.exports = [
  {
    originalSchemaPackage: '@angular/build',
    originalSchemaPath: 'src/builders/application/schema.json',
    schemaExtensionPaths: [`${__dirname}/application/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/application/schema.json`,
  },
  {
    originalSchemaPackage: '@angular/build',
    originalSchemaPath: 'src/builders/dev-server/schema.json',
    schemaExtensionPaths: [`${__dirname}/dev-server/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/dev-server/schema.json`,
  },
];
