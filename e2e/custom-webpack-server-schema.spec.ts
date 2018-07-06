describe('custom webpack server builder test', () => {
	let customWebpackBrowserSchema: any;

	beforeEach(() => {
		jest.resetModules()
		customWebpackBrowserSchema = require('../src/custom-webpack/server/schema.json');
	});

	it('Should fit the schema of @angular-devkit/build-angular:server', () => {
		const originalBrowserSchema = require('@angular-devkit/build-angular/src/server/schema.json');
		customWebpackBrowserSchema.properties['webpackConfigPath'] = undefined;
		expect(originalBrowserSchema.properties).toEqual(customWebpackBrowserSchema.properties);
	});

	it('Should contain webpackConfigPath', () => {
		expect(customWebpackBrowserSchema.properties.webpackConfigPath).toMatchObject({type: 'string'});
	})
});
