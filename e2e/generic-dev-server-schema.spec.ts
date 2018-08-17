describe('generic dev server builder test', () => {
	let genericDevServerSchema: any;

	beforeEach(() => {
		jest.resetModules()
		genericDevServerSchema = require('../packages/generic/dev-server/schema.json');
	});

	it('Should fit the schema of @angular-devkit/build-angular:dev-server', () => {
		const originalDevServerSchema = require('@angular-devkit/build-angular/src/dev-server/schema.json');
		expect(genericDevServerSchema.properties).toEqual(originalDevServerSchema.properties);
	});
});
