import {
  Rule,
  SchematicContext,
  Tree,
  chain,
} from '@angular-devkit/schematics';
import { readJsonFile, writeJsonFile } from './file-utils';
import { parseVersion, getMajorVersion } from './version-utils';

export interface NgAddOptions {
  skipInstall?: boolean;
  skipPackageJson?: boolean;
}

/**
 * Base factory for ng-add schematics.
 * Handles common initialization tasks like updating package.json and managing dependencies.
 */
export function createNgAddRule(
  builderPackageName: string,
  builderVersion: string,
  options: NgAddOptions = {}
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      updatePackageJson(builderPackageName, builderVersion, options),
      logCompletion(builderPackageName),
    ])(tree, context);
  };
}

/**
 * Updates package.json to add the builder package as a dev dependency.
 */
function updatePackageJson(
  builderPackageName: string,
  builderVersion: string,
  options: NgAddOptions
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.skipPackageJson) {
      context.logger.info('Skipping package.json update (--skip-package-json)');
      return tree;
    }

    try {
      const packageJsonPath = '/package.json';
      const packageJson = readJsonFile<any>(tree, packageJsonPath);

      // Ensure devDependencies exists
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }

      // Add the builder package
      packageJson.devDependencies[builderPackageName] = `^${builderVersion}`;

      writeJsonFile(tree, packageJsonPath, packageJson);

      context.logger.info(
        `✓ Added ${builderPackageName}@^${builderVersion} to devDependencies`
      );
    } catch (error) {
      context.logger.warn(`Failed to update package.json: ${error}`);
      // Don't fail the schematic on package.json errors
    }

    return tree;
  };
}

/**
 * Logs completion message.
 */
function logCompletion(builderPackageName: string): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.logger.info('');
    context.logger.info(`✓ ${builderPackageName} ng-add completed successfully`);
    context.logger.info('');
    context.logger.info('Next steps:');
    context.logger.info('1. Install dependencies: npm install (or yarn install)');
    context.logger.info('2. Update your angular.json to use the new builder');
    context.logger.info('3. Run your build/test command');
    context.logger.info('');
    return _tree;
  };
}
