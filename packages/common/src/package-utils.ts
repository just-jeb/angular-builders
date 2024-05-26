import { dirname, join } from 'path';

export function resolvePackagePath(packageName: string, subPath: string) {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    const packageDir = dirname(packageJsonPath);
    return join(packageDir, subPath);
  } catch (error: any) {
    console.error(`Failed to resolve path for package ${packageName}: ${error.message}`);
    process.exit(1);
  }
}
