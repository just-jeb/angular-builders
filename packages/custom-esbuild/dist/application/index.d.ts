import { BuilderContext } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { CustomEsbuildApplicationSchema } from '../custom-esbuild-schema';
export declare function buildCustomEsbuildApplication(options: CustomEsbuildApplicationSchema, context: BuilderContext): import("rxjs").Observable<import("@angular-devkit/architect").BuilderOutput>;
declare const _default: import("@angular-devkit/architect").Builder<json.JsonObject & import("@angular/build").ApplicationBuilderOptions & {
    plugins?: import("../custom-esbuild-schema").PluginConfig[];
    indexHtmlTransformer?: string;
}>;
export default _default;
