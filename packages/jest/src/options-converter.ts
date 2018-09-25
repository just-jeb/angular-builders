import {JestBuilderSchema} from "./schema";

export class OptionsConverter {
  static convertToCliArgs(options: Partial<JestBuilderSchema>): string[] {
    const argv = [];
    for (const option of Object.keys(options)) {
      let optionValue = options[option];
      if (optionValue === true) {
        argv.push(`--${option}`);
      } else if (typeof optionValue === 'string') {
        if (optionValue.includes(' ') && !optionValue.startsWith('"') && !optionValue.endsWith('"')) {
          optionValue = `"${optionValue}"`;
        }
        argv.push(`--${option}=${optionValue}`);
      }
    }

    return argv;
  }
}