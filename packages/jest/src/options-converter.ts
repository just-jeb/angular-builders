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
      } else if (
        POSITIONAL_ARRAY_OPTIONS.has(option) &&
        (Array.isArray(optionValue) || typeof optionValue === 'string')
      ) {
        argv.push(`--${option}`);
        const items = Array.isArray(optionValue) ? optionValue : [optionValue];
        for (const item of items) {
          for (const file of String(item).split(',')) {
            if (file) positionalsToAppend.push(file);
          }
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
