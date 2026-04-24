import { SchemaObject as JestBuilderSchema } from './schema';

/**
 * Options that Jest treats as a boolean flag with file paths as positional arguments.
 * Jest parses these via yargs `_` (non-flag args), not as `--flag=value` or repeated flag pairs.
 *
 * Angular CLI passes comma-separated CLI values as a single string for array-type schema fields
 * (e.g. `ng test --find-related-tests file1,file2` → options.findRelatedTests = 'file1,file2').
 *
 * These must be split and emitted as: `--findRelatedTests file1 file2`
 *
 * See: https://jestjs.io/docs/cli#--findrelatedtests-spaceseparatedlistofsourcefiles
 */
const POSITIONAL_ARRAY_OPTIONS = new Set(['findRelatedTests']);

export class OptionsConverter {
  convertToCliArgs(options: Partial<JestBuilderSchema>): string[] {
    const argv = [];
    let nonFlagArgs: string | undefined;
    const positionalArgs: string[] = [];

    for (const option of Object.keys(options)) {
      let optionValue = options[option];
      if (option == '--') {
        nonFlagArgs = (optionValue as string[]).join(' ');
      } else if (POSITIONAL_ARRAY_OPTIONS.has(option)) {
        // Angular CLI passes comma-separated values as a single string for array-type schema fields.
        // Split into individual paths and emit as: --flag path1 path2 (boolean + positional args).
        const paths = Array.isArray(optionValue)
          ? (optionValue as string[])
          : (optionValue as string).split(',');
        argv.push(`--${option}`);
        positionalArgs.push(...paths);
      } else if (optionValue === true) {
        argv.push(`--${option}`);
      } else if (typeof optionValue === 'string' || typeof optionValue === 'number') {
        argv.push(`--${option}=${optionValue}`);
      } else if (Array.isArray(optionValue)) {
        for (const item of optionValue) {
          argv.push(`--${option}`, item);
        }
      }
    }
    if (nonFlagArgs) {
      argv.push(nonFlagArgs);
    }
    if (positionalArgs.length > 0) {
      argv.push(...positionalArgs);
    }
    return argv;
  }
}
