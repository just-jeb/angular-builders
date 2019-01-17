import {JestBuilderSchema} from "./schema";

export class OptionsConverter {
  convertToCliArgs(options: Partial<JestBuilderSchema>): string[] {
    const argv = [];
    for (const option of Object.keys(options)) {
      let optionValue = options[option];
      if (optionValue === true) {
        argv.push(`--${option}`);
      } else if (typeof optionValue === 'string') {
        argv.push(`--${option}=${optionValue}`);
      } else if (Array.isArray(optionValue)) {
        for(const item of optionValue){
          argv.push(`--${option}=${item}`)
        }
      }
    }

    return argv;
  }
}