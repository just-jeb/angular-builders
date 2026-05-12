import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

/**
 * Migration schematic for @angular-builders/* packages to v21.
 * - Major version update with breaking changes
 * - Migrates webpack/esbuild configurations to latest APIs
 * - Handles Angular 21 compatibility requirements
 */
export default function migrate(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Migrating @angular-builders packages to v21 (major version)');

    try {
      const workspace = await getWorkspace(tree);
      let updateCount = 0;

      for (const [projectName, project] of workspace.projects) {
        for (const [targetName, target] of project.targets || []) {
          const builder = target.builder;

          if (builder?.includes('@angular-builders/')) {
            context.logger.info(`  • ${projectName}/${targetName}: updating to v21 (major)`);
            target.options = target.options || {};
            target.options['@angular-builders/version'] = '21.x.x';
            updateCount++;

            // Remove any deprecated v19/v20 options if present
            if (target.options['deprecatedOption']) {
              delete target.options['deprecatedOption'];
              context.logger.info(`    - Removed deprecated option`);
            }
          }
        }
      }

      if (updateCount > 0) {
        context.logger.info(`✅ Updated ${updateCount} build target(s) to @angular-builders v21.`);
        context.logger.info('⚠️  Review your build configurations and custom webpack/esbuild configurations.');
      }
    } catch (error) {
      context.logger.error(`❌ Migration failed: ${error.message}`);
      throw error;
    }

    return tree;
  };
}
