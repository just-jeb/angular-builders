import { SchemaObject as JestBuilderSchema } from './schema';

/**
 * Options that Jest treats as a boolean flag with file paths as trailing positional
 * arguments (parsed via yargs `_`). For these options the converter emits the flag
 * once and appends every path as a bare positional at the end of argv.
 *
 * Example: `--findRelatedTests file1.ts file2.ts`
 * Jest yargs parsing: `findRelatedTests=true`, `_=['file1.ts', 'file2.ts']`
 */
const POSITIONAL_ARRAY_OPTIONS = new Set(['findRelatedTests']);

export class OptionsConverter {
  convertToCliArgs(options: Partial<JestBuilderSchema>): string[] {
    const argv = [];
    const positionalArgs: string[] = [];
    let nonFlagArgs: string | undefined;

    for (const option of Object.keys(options)) {
      const optionValue = options[option];

      if (option === '--') {
        nonFlagArgs = (optionValue as string[]).join(' ');
      } else if (POSITIONAL_ARRAY_OPTIONS.has(option)) {
        // These options use a boolean flag + trailing positional file paths.
        // Angular CLI delivers them as a proper string array (one element per file).
        argv.push(`--${option}`);
        positionalArgs.push(...(optionValue as string[]));
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

    return [...argv, ...positionalArgs];
  }
}
