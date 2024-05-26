import { resolvePackagePath } from '@angular-builders/common';

describe('Custom ESBuild schema tests', () => {
  let customEsbuildApplicationSchema: any;
  let customEsbuildDevServerSchema: any;

  beforeEach(() => {
    jest.resetModules();
    customEsbuildApplicationSchema = require('../dist/application/schema.json');
    customEsbuildDevServerSchema = require('../dist/dev-server/schema.json');
  });

  it('should fit the schema of the `@angular-devkit/build-angular:application`', () => {
    const path = resolvePackagePath('@angular/build', 'src/builders/application/schema.json');
    const originalApplicationSchema = require(path);
    customEsbuildApplicationSchema.properties['plugins'] = undefined;
    customEsbuildApplicationSchema.properties['indexHtmlTransformer'] = undefined;
    expect(originalApplicationSchema.properties).toEqual(customEsbuildApplicationSchema.properties);
  });

  it('should fit the schema of the `@angular-devkit/build-angular:dev-server`', () => {
    const originalDevServerSchema = require('@angular-devkit/build-angular/src/builders/dev-server/schema.json');
    customEsbuildDevServerSchema.properties['middlewares'] = undefined;
    expect(originalDevServerSchema.properties).toEqual(customEsbuildDevServerSchema.properties);
  });
});
