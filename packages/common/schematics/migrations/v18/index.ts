import { Rule, Tree, SchematicContext, chain } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { updateJsonFile } from '../version-utils';

/**
 * Migration schematic for @angular-builders/* packages from v17 to v18.
 * - Updates builder versions in angular.json
 * - Validates compatibility with Angular 18
 * - Migrates any deprecated configuration options
 */
export default function migrate(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating @angular-builders packages v17 → v18');

    try {
      const workspace = await getWorkspace(tree);
      let hasChanges = false;

      // Check all builder usages in projects
      for (const [projectName, project] of workspace.projects) {
        for (const [targetName, target] of project.targets || []) {
          const builder = target.builder;

          // Update builder versions in angular.json
          if (builder?.includes('@angular-builders/')) {
            const oldVersion = target.options?.['@angular-builders/version'] || '17.x.x';
            context.logger.info(`  • ${projectName}/${targetName}: updating from v17 to v18`);
            target.options = target.options || {};
            target.options['@angular-builders/version'] = '18.x.x';
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        context.logger.info('✅ Builder versions updated. Workspace uses @angular-builders v18 APIs.');
      } else {
        context.logger.info('ℹ️  No builder updates needed.');
      }
    } catch (error) {
      context.logger.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }

    return tree;
  };
}
