// Base schemes from build-angular@0.1202.7
module.exports = [
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/builders/application/schema.json',
    schemaExtensionPaths: [
      `${__dirname}/application/schema.ext.json`,
      `${__dirname}/schema.ext.json`,
    ],
    newSchemaPath: `${__dirname}/../dist/application/schema.json`,
  },
  {
    originalSchemaPath: '@angular-devkit/build-angular/src/builders/dev-server/schema.json',
    schemaExtensionPaths: [`${__dirname}/dev-server/schema.ext.json`],
    newSchemaPath: `${__dirname}/../dist/dev-server/schema.json`,
  },
];
