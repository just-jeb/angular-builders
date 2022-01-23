import { writeFileSync } from 'fs';
import { merge } from 'lodash-es';

interface CustomSchema {
  originalSchemaPath: string;
  schemaExtensionPaths: string[];
  newSchemaPath: string;
}

const wd = process.cwd();
const { default: schemesToMerge }: { default: CustomSchema[] } = await import(`${wd}/src/schemes`);
console.log(schemesToMerge);

for (const { originalSchemaPath, schemaExtensionPaths, newSchemaPath } of schemesToMerge) {
  const { default: originalSchema } = await import(`${originalSchemaPath}`);
  console.log(originalSchema);
  const schemaExtensions = await Promise.all(
    schemaExtensionPaths.map((path: string) => import(path).then(({ default: schema }) => schema))
  );
  const newSchema = schemaExtensions.reduce(
    (extendedSchema: any, currentExtension: any) => merge(extendedSchema, currentExtension),
    originalSchema
  );
  writeFileSync(newSchemaPath, JSON.stringify(newSchema, null, 2), 'utf-8');
}
