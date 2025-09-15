import { resolvePackagePath } from '@angular-builders/common';
import { remove } from 'lodash';

describe('Custom ESBuild schema tests', () => {
  let customEsbuildApplicationSchema: any;
  let customEsbuildDevServerSchema: any;
  let customEsbuildUnitTestSchema: any;

  beforeEach(() => {
    jest.resetModules();
    customEsbuildApplicationSchema = require('../dist/application/schema.json');
    customEsbuildDevServerSchema = require('../dist/dev-server/schema.json');
    customEsbuildUnitTestSchema = require('../dist/unit-test/schema.json');
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

  it('should fit the schema of the `@angular/build:unit-test` without `runner` property', () => {
    const path = resolvePackagePath('@angular/build', 'src/builders/unit-test/schema.json');
    const originalUnitTestSchema = require(path);
    originalUnitTestSchema.properties['runner'] = undefined;
    remove(originalUnitTestSchema.required, prop => prop === 'runner');
    customEsbuildUnitTestSchema.properties['plugins'] = undefined;
    expect(originalUnitTestSchema.properties).toEqual(customEsbuildUnitTestSchema.properties);
    expect(originalUnitTestSchema.required).toEqual(customEsbuildUnitTestSchema.required);
    console.log(customEsbuildUnitTestSchema.required);
  });
});
