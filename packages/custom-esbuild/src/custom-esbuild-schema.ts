import { ApplicationBuilderOptions, DevServerBuilderOptions } from '@angular/build';

export type CustomEsbuildApplicationSchema = ApplicationBuilderOptions & {
  plugins?: string[];
  indexHtmlTransformer?: string;
};

export type CustomEsbuildDevServerSchema = DevServerBuilderOptions & {
  middlewares?: string[];
};
