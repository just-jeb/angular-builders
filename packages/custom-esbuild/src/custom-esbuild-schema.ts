import { ApplicationBuilderOptions, DevServerBuilderOptions } from '@angular-devkit/build-angular';

export type CustomEsbuildApplicationSchema = ApplicationBuilderOptions & {
  plugins?: string[];
  indexHtmlTransformer?: string;
};

export type CustomEsbuildDevServerSchema = DevServerBuilderOptions & {
  middlewares?: string[];
};
