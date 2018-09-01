import {JestBuilderSchema} from "./schema";

export class OptionsConverter {
  static convertToCliArgs(options: Partial<JestBuilderSchema>): string[] {
    const argv = [];
    for (const option of Object.keys(options)) {
      if (options[option] === true) {
        argv.push(`--${option}`);
      } else if (typeof options[option] === 'string'){
        argv.push(`--${option}="${options[option]}"`);
      }
    }

    return argv;
  }
}