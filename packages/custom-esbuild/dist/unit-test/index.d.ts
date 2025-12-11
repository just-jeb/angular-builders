import { BuilderContext } from '@angular-devkit/architect';
import { UnitTestBuilderOptions } from '@angular/build';
import { json } from '@angular-devkit/core';
import { CustomEsbuildUnitTestSchema } from '../custom-esbuild-schema';
export declare function executeCustomEsbuildUnitTestBuilder(options: CustomEsbuildUnitTestSchema, context: BuilderContext): import("rxjs").Observable<import("@angular-devkit/architect").BuilderOutput>;
declare const _default: import("@angular-devkit/architect").Builder<json.JsonObject & Omit<UnitTestBuilderOptions, "runner"> & {
    plugins?: import("../custom-esbuild-schema").PluginConfig[];
}>;
export default _default;
