import {writeFileSync} from 'fs';
import {merge} from 'lodash';

interface CustomSchema {
	originalSchemaPath: string;
	schemaExtensionPaths: string[],
	newSchemaPath: string;
}

const schemesToMerge: CustomSchema[] = [
	{
		originalSchemaPath: '@angular-devkit/build-angular/src/browser/schema.json',
		schemaExtensionPaths: ['./src/custom-webpack/browser/schema.ext.json', './src/custom-webpack/schema.ext.json'],
		newSchemaPath: './src/custom-webpack/browser/schema.json'
	},
	{
		originalSchemaPath: '@angular-devkit/build-angular/src/server/schema.json',
		schemaExtensionPaths: ['./src/custom-webpack/server/schema.ext.json', './src/custom-webpack/schema.ext.json'],
		newSchemaPath: './src/custom-webpack/server/schema.json'
	}
];

for(const customSchema of schemesToMerge){
	const originalSchema = require(customSchema.originalSchemaPath);
	const schemaExtensions = customSchema.schemaExtensionPaths.map(path => require(path));
	const newSchema = schemaExtensions.reduce((extendedSchema, currentExtension) => merge(extendedSchema, currentExtension), originalSchema);
	writeFileSync(customSchema.newSchemaPath, JSON.stringify(newSchema, null, 2), 'utf-8');
}