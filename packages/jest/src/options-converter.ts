import { SchemaObject as JestBuilderSchema } from './schema';

export class OptionsConverter {
  convertToCliArgs(options: Partial<JestBuilderSchema>): string[] {
    const argv = [];
    let nonFlagArgs: string | undefined;
    for (const option of Object.keys(options)) {
      let optionValue = options[option];
      if (option == '--') {
        nonFlagArgs = (optionValue as string[]).join(' ');
      } else if (optionValue === true) {
        argv.push(`--${option}`);
      } else if (typeof optionValue === 'string' || typeof optionValue === 'number') {
        argv.push(`--${option}=${optionValue}`);
      } else if (Array.isArray(optionValue)) {
        for (const item of optionValue) {
          argv.push(`--${option}=${item}`);
        }
      }
    }
    if (nonFlagArgs) {
      argv.push(nonFlagArgs);
    }
    return argv;
  }
}
