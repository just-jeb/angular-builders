import { writeFileSync } from 'fs';
import { merge } from 'lodash';

interface CustomSchema {
  originalSchemaPath: string;
  schemaExtensionPaths: string[];
  newSchemaPath: string;
}

const wd = process.cwd();
const schemesToMerge: CustomSchema[] = require(`${wd}/src/schemes`);

for (const { originalSchemaPath, schemaExtensionPaths, newSchemaPath } of schemesToMerge) {
  const originalSchema = require(`${originalSchemaPath}`);
  const schemaExtensions = schemaExtensionPaths.map((path: string) => require(path));
  const newSchema = schemaExtensions.reduce(
    (extendedSchema: any, currentExtension: any) => merge(extendedSchema, currentExtension),
    originalSchema
  );
  writeFileSync(newSchemaPath, JSON.stringify(newSchema, null, 2), 'utf-8');
}
