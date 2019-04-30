import {customWebpackConfig} from "./custom-webpack-config-schema";


describe('custom webpack karma builder test', () => {
	let customWebpackBrowserSchema: any;

	beforeEach(() => {
		jest.resetModules()
		customWebpackBrowserSchema = require('../dist/karma/schema.json');
	});

	it('Should fit the schema of @angular-devkit/build-angular:karma', () => {
		const originalBrowserSchema = require('@angular-devkit/build-angular/src/karma/schema.json');
		customWebpackBrowserSchema.properties['customWebpackConfig'] = undefined;
		expect(originalBrowserSchema.properties).toEqual(customWebpackBrowserSchema.properties);
	});

	it('Should contain customWebpackConfig', () => {
		expect(customWebpackBrowserSchema.properties.customWebpackConfig).toEqual(customWebpackConfig);
	});
});
