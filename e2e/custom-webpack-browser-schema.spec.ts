describe('custom webpack browser builder test', () => {
	let customWebpackBrowserSchema: any;

	beforeEach(() => {
		jest.resetModules()
		customWebpackBrowserSchema = require('../src/custom-webpack/browser/schema.json');
	});

	it('Should fit the schema of @angular-devkit/build-angular:browser', () => {
		const originalBrowserSchema = require('@angular-devkit/build-angular/src/browser/schema.json');
		customWebpackBrowserSchema.properties['webpackConfigPath'] = undefined;
		expect(originalBrowserSchema.properties).toEqual(customWebpackBrowserSchema.properties);
	});

	it('Should contain webpackConfigPath', () => {
		expect(customWebpackBrowserSchema.properties.webpackConfigPath).toMatchObject({type: 'string'});
	})
});
