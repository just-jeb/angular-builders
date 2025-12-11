import { BuilderContext } from '@angular-devkit/architect';
import { DevServerBuilderOptions, DevServerBuilderOutput } from '@angular/build';
import { json } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { CustomEsbuildDevServerSchema } from '../custom-esbuild-schema';
export declare function executeCustomDevServerBuilder(options: CustomEsbuildDevServerSchema, context: BuilderContext): Observable<DevServerBuilderOutput>;
declare const _default: import("@angular-devkit/architect").Builder<DevServerBuilderOptions & json.JsonObject>;
export default _default;
