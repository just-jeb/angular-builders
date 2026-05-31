import { SchemaObject as JestBuilderSchema } from './schema';

const POSITIONAL_ARRAY_OPTIONS = new Set(['findRelatedTests']);

export class OptionsConverter {
  convertToCliArgs(options: Partial<JestBuilderSchema>): string[] {
    const argv: string[] = [];
    const positionalsToAppend: string[] = [];
    let nonFlagArgs: string | undefined;
    for (const option of Object.keys(options)) {
      const optionValue = (options as Record<string, unknown>)[option];
      if (option == '--') {
        nonFlagArgs = (optionValue as string[]).join(' ');
      } else if (POSITIONAL_ARRAY_OPTIONS.has(option)) {
        const items = Array.isArray(optionValue)
          ? optionValue
          : typeof optionValue === 'string'
            ? [optionValue]
            : [];
        const files: string[] = [];
        for (const item of items) {
          for (const file of String(item).split(',')) {
            if (file) files.push(file);
          }
        }
        // Only emit the flag when actual file args are present. The option is an
        // array with no schema default, so Angular materializes it as `[]` on every
        // run; emitting a bare `--findRelatedTests` then makes Jest reject the argv
        // and abort with a usage error.
        if (files.length > 0) {
          argv.push(`--${option}`);
          positionalsToAppend.push(...files);
        }
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
    argv.push(...positionalsToAppend);
    if (nonFlagArgs) {
      argv.push(nonFlagArgs);
    }
    return argv;
  }
}
