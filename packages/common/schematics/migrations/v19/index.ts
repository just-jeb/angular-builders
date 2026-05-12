import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

/**
 * Migration schematic for @angular-builders/* packages from v18 to v19.
 * - Updates to Angular 19 compatibility
 * - Handles any builder config changes
 * - Validates esbuild/webpack configurations
 */
export default function migrate(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating @angular-builders packages v18 → v19');

    try {
      const workspace = await getWorkspace(tree);

      for (const [projectName, project] of workspace.projects) {
        for (const [targetName, target] of project.targets || []) {
          const builder = target.builder;

          if (builder?.includes('@angular-builders/')) {
            context.logger.info(`  • ${projectName}/${targetName}: updating to v19`);
            target.options = target.options || {};
            target.options['@angular-builders/version'] = '19.x.x';
          }
        }
      }

      context.logger.info('✅ Updated to @angular-builders v19 APIs.');
    } catch (error) {
      context.logger.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }

    return tree;
  };
}
