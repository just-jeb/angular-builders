import { resolvePackagePath } from '@angular-builders/common';

describe('Custom ESBuild schema tests', () => {
  let customEsbuildApplicationSchema: any;
  let customEsbuildDevServerSchema: any;

  beforeEach(() => {
    jest.resetModules();
    customEsbuildApplicationSchema = require('../dist/application/schema.json');
    customEsbuildDevServerSchema = require('../dist/dev-server/schema.json');
  });

  it('should fit the schema of the `@angular/build:application`', () => {
    const path = resolvePackagePath('@angular/build', 'src/builders/application/schema.json');
    const originalApplicationSchema = require(path);
    customEsbuildApplicationSchema.properties['plugins'] = undefined;
    customEsbuildApplicationSchema.properties['indexHtmlTransformer'] = undefined;
    expect(originalApplicationSchema.properties).toEqual(customEsbuildApplicationSchema.properties);
  });

  it('should fit the schema of the `@angular/build:dev-server`', () => {
    const path = resolvePackagePath('@angular/build', 'src/builders/dev-server/schema.json');
    const originalDevServerSchema = require(path);
    customEsbuildDevServerSchema.properties['middlewares'] = undefined;
    expect(originalDevServerSchema.properties).toEqual(customEsbuildDevServerSchema.properties);
  });
});
