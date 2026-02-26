import { writeFileSync } from 'fs';
import { resolvePackagePath } from './packages/common/src';

interface CustomSchema {
  originalSchemaPackage?: string;
  originalSchemaPath: string;
  schemaExtensionPaths: string[];
  newSchemaPath: string;
}

/**
 * Deep merge two objects, invoking a customizer for each key.
 * If the customizer returns `undefined`, the default deep-merge behavior applies.
 */
function deepMergeWith(
  target: any,
  source: any,
  customizer: (targetVal: any, sourceVal: any) => any
): any {
  if (source === undefined || source === null) {
    return target;
  }
  const result = Array.isArray(target) ? [...target] : { ...target };
  for (const key of Object.keys(source)) {
    const customResult = customizer(result[key], source[key]);
    if (customResult !== undefined) {
      result[key] = customResult;
    } else if (
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key]) &&
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMergeWith(result[key], source[key], customizer);
    } else {
      result[key] = source[key];
    }
  }
  return result;
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
    (extendedSchema: any, currentExtension: any) =>
      deepMergeWith(extendedSchema, currentExtension, schemaMerger),
    originalSchema
  );
  writeFileSync(newSchemaPath, JSON.stringify(newSchema, schemaValueReplacer, 2), 'utf-8');
}

function schemaMerger(resultSchemaValue: unknown, extensionSchemaValue: unknown) {
  if (Array.isArray(extensionSchemaValue) && extensionSchemaValue[0] === '__REPLACE__') {
    return extensionSchemaValue.slice(1);
  }
  return undefined;
}

function schemaValueReplacer(key: unknown, value: unknown) {
  return value === '__DELETE__' ? undefined : value;
}
