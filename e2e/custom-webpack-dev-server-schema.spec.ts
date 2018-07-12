describe('custom webpack server builder test', () => {
	let customWebpackDevServerSchema: any;

	beforeEach(() => {
		jest.resetModules()
		customWebpackDevServerSchema = require('../src/custom-webpack/dev-server/schema.json');
	});

	it('Should fit the schema of @angular-devkit/build-angular:dev-server', () => {
		const originaldevServerSchema = require('@angular-devkit/build-angular/src/dev-server/schema.json');
		customWebpackDevServerSchema.properties['webpackConfigPath'] = undefined;
		expect(originaldevServerSchema.properties).toEqual(customWebpackDevServerSchema.properties);
	});

	it('Should contain webpackConfigPath', () => {
		expect(customWebpackDevServerSchema.properties.webpackConfigPath).toMatchObject({type: 'string'});
	})
});
