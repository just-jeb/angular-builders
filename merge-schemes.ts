import {writeFileSync} from 'fs';
import {merge} from 'lodash';

interface CustomSchema {
	originalSchemaPath: string;
	schemaExtensionPath: string,
	newSchemaPath: string;
}

const schemesToMerge: CustomSchema[] = [
	{
		originalSchemaPath: '@angular-devkit/build-angular/src/browser/schema.json',
		schemaExtensionPath: './src/custom-webpack/browser/schema.ext.json',
		newSchemaPath: './src/custom-webpack/browser/schema.json'
	},
	{
		originalSchemaPath: '@angular-devkit/build-angular/src/server/schema.json',
		schemaExtensionPath: './src/custom-webpack/server/schema.ext.json',
		newSchemaPath: './src/custom-webpack/server/schema.json'
	}
];

for(const customSchema of schemesToMerge){
	const originalSchema = require(customSchema.originalSchemaPath);
	const schemaExtension = require(customSchema.schemaExtensionPath);
	const newSchema = merge(originalSchema, schemaExtension);
	writeFileSync(customSchema.newSchemaPath, JSON.stringify(newSchema, null, 2), 'utf-8');
}