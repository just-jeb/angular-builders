import { Rule } from '@angular-devkit/schematics';
import { migrateToJitiLoader } from '@angular-builders/common/schematics';

/**
 * v22: the builder now loads TypeScript esbuild plugins and index transformers via jiti
 * instead of ts-node. Delegates to the shared migration in `@angular-builders/common`.
 */
export function migrateV22(): Rule {
  return migrateToJitiLoader('@angular-builders/custom-esbuild');
}
