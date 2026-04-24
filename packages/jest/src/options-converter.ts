import { SchemaObject as JestBuilderSchema } from './schema';

/**
 * Options whose values are positional arguments following a boolean flag.
 * Jest parses these via yargs `_` (non-flag args), not as repeated --flag value pairs.
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
      } else if (optionValue === true) {
        argv.push(`--${option}`);
      } else if (typeof optionValue === 'string' || typeof optionValue === 'number') {
        argv.push(`--${option}=${optionValue}`);
      } else if (Array.isArray(optionValue)) {
        if (POSITIONAL_ARRAY_OPTIONS.has(option)) {
          // These are boolean flags whose "values" are positional file args.
          // e.g. --findRelatedTests file1 file2 (not --findRelatedTests=file1 --findRelatedTests=file2)
          argv.push(`--${option}`);
          positionalArgs.push(...optionValue);
        } else {
          for (const item of optionValue) {
            argv.push(`--${option}`, item);
          }
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
