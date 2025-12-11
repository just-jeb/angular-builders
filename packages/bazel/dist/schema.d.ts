/**
 * Options for Bazel Builder
 */
export interface Schema {
    /**
     * Common commands supported by Bazel.
     */
    bazelCommand: BazelCommand;
    /**
     * Target to be executed under Bazel.
     */
    targetLabel: string;
    /**
     * If true, watch the filesystem using ibazel.
     */
    watch?: boolean;
}
/**
 * Common commands supported by Bazel.
 */
export declare enum BazelCommand {
    Build = "build",
    Run = "run",
    Test = "test"
}
export declare class Convert {
    static toSchema(json: string): Schema;
    static schemaToJson(value: Schema): string;
}
