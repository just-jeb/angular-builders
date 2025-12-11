import { SchemaObject as JestBuilderSchema } from './schema';
export declare class OptionsConverter {
    convertToCliArgs(options: Partial<JestBuilderSchema>): string[];
}
