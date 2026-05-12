import {
  Rule,
  SchematicContext,
  chain,
  externalSchematic,
  schematic,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  getPackageJsonDependency,
} from '@schematics/angular/utility/dependencies';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { createNgAddRule } from '../../../common/schematics/ng-add-init';

export interface NgAddOptions {
  project?: string;
  skipInstall?: boolean;
  skipConfig?: boolean;
}

/**
 * ng-add schematic for @angular-builders/custom-esbuild
 * Installs the package and configures application/dev-server builders in angular.json
 */
export function ngAddSchematic(options: NgAddOptions): Rule {
  return async (host, context) => {
    const tasks: Rule[] = [];

    // Step 1: Add package.json dependency
    const pkgJson = host.read('package.json');
    if (!pkgJson) {
      throw new Error('package.json not found');
    }

    const pkgContent = JSON.parse(pkgJson.toString());
    const currentVersion = getPackageJsonDependency(host, '@angular-builders/custom-esbuild');

    if (!currentVersion) {
      addPackageJsonDependency(host, {
        type: 'devDependencies',
        name: '@angular-builders/custom-esbuild',
        version: `^${require('../../package.json').version}`,
      });
      context.logger.info('✅ Added @angular-builders/custom-esbuild to devDependencies');
    } else {
      context.logger.info('ℹ️  @angular-builders/custom-esbuild already installed');
    }

    // Step 2: Install dependencies
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
      context.logger.info('📦 Package installation scheduled');
    }

    // Step 3: Run ng-add-init for angular.json configuration
    if (!options.skipConfig) {
      const initTask = context.addTask(
        new RunSchematicTask('ng-add-init', {
          project: options.project,
          builder: '@angular-builders/custom-esbuild:application',
          builderConfig: {
            options: {
              esbuildConfig: './esbuild.config.js',
            },
          },
        })
      );
      context.logger.info('⚙️  angular.json configuration scheduled');
    }

    return chain(tasks);
  };
}
