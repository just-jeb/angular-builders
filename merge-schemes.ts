import { writeFileSync } from 'fs';
import { merge } from 'lodash';
import { resolvePackagePath } from './packages/common/src';

interface CustomSchema {
  originalSchemaPackage?: string;
  originalSchemaPath: string;
  schemaExtensionPaths: string[];
  newSchemaPath: string;
}

const wd = process.cwd();
const schemesToMerge: CustomSchema[] = require(`${wd}/src/schemes`);

for (const {
  originalSchemaPackage,
  originalSchemaPath,
  schemaExtensionPaths,
  newSchemaPath,
} of schemesToMerge) {
  const resolvedOriginalSchemaPath = originalSchemaPackage
    ? // Need it to bypass the Node resolution mechanism which respects only exported paths, currently only for esbuild
      resolvePackagePath(originalSchemaPackage, originalSchemaPath)
    : originalSchemaPath;

  const originalSchema = require(resolvedOriginalSchemaPath);
  const schemaExtensions = schemaExtensionPaths.map((path: string) => require(path));
  const newSchema = schemaExtensions.reduce(
    (extendedSchema: any, currentExtension: any) => merge(extendedSchema, currentExtension),
    originalSchema
  );
  writeFileSync(newSchemaPath, JSON.stringify(newSchema, null, 2), 'utf-8');
}
