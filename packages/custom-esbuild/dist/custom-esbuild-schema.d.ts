import { ApplicationBuilderOptions, DevServerBuilderOptions, UnitTestBuilderOptions } from '@angular/build';
export type PluginConfig = string | {
    path: string;
    options?: Record<string, unknown>;
};
export type CustomEsbuildApplicationSchema = ApplicationBuilderOptions & {
    plugins?: PluginConfig[];
    indexHtmlTransformer?: string;
};
export type CustomEsbuildDevServerSchema = DevServerBuilderOptions & {
    middlewares?: string[];
};
export type CustomEsbuildUnitTestSchema = Omit<UnitTestBuilderOptions, 'runner'> & {
    plugins?: PluginConfig[];
};
