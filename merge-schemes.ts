import {writeFileSync} from 'fs';
import {merge} from 'lodash';

interface CustomSchema {
	originalSchemaPath: string;
	schemaExtensionPaths: string[],
	newSchemaPath: string;
}

const wd = process.cwd();
const schemesToMerge: CustomSchema[] = require(`${wd}/schemes`);

for(const customSchema of schemesToMerge){
	const originalSchema = require(customSchema.originalSchemaPath);
	const schemaExtensions = customSchema.schemaExtensionPaths.map((path: string) => require(`${wd}/${path}`));
	const newSchema = schemaExtensions.reduce((extendedSchema: any, currentExtension: any) => merge(extendedSchema, currentExtension), originalSchema);
	writeFileSync(`${wd}/${customSchema.newSchemaPath}`, JSON.stringify(newSchema, null, 2), 'utf-8');
}
