export interface SchemaObject {
    /**
     * Timestamp format
     */
    format?: string;
    /**
     * Path to the timestamp file
     */
    path?: string;
}
export declare class Convert {
    static toSchema(json: string): any[] | boolean | number | number | null | SchemaObject | string;
    static schemaToJson(value: any[] | boolean | number | number | null | SchemaObject | string): string;
}
