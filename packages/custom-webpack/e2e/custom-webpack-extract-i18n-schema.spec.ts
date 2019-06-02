import {customWebpackConfig} from "./custom-webpack-config-schema";

describe('custom webpack extract-i18n builder test', () => {
	let customWebpackBrowserSchema: any;

	beforeEach(() => {
		jest.resetModules()
		customWebpackBrowserSchema = require('../src/extract-i18n/schema.json');
	});

	it('Should fit the schema of @angular-devkit/build-angular:extract-i18n', () => {
		const originalBrowserSchema = require('@angular-devkit/build-angular/src/extract-i18n/schema.json');
		customWebpackBrowserSchema.properties['customWebpackConfig'] = undefined;
		expect(originalBrowserSchema.properties).toEqual(customWebpackBrowserSchema.properties);
	});

	it('Should contain customWebpackConfig', () => {
		expect(customWebpackBrowserSchema.properties.customWebpackConfig).toEqual(customWebpackConfig);
	});
});
