export interface JestBuilderSchema {
  configPath: string;

  [option: string]: string | boolean;
}