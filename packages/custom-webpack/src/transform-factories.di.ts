import { FactoryProvider, InjectionToken, Provider } from 'injection-js';
import { BuilderContext } from '@angular-devkit/architect';
import { IndexHtmlTransform } from '@angular-devkit/build-angular/src/utils/index-file/index-html-generator';
import { CustomWebpackSchema } from './custom-webpack-schema';
import {
  customWebpackConfigurationTransformFactory,
  indexHtmlTransformFactory,
  Transforms,
  transformsFactory,
  WebpackConfigurationTransform,
} from './transform-factories';

export const CUSTOM_WEBPACK_SCHEMA_TOKEN = new InjectionToken<CustomWebpackSchema>(
  '[@angular-builders/custom-webpack] CustomWebpackSchema'
);
export const BUILD_CONTEXT_TOKEN = new InjectionToken<BuilderContext>(
  '[@angular-builders/custom-webpack] BuilderContext'
);

export const WEBPACK_CONFIG_TRANSFORM_TOKEN = new InjectionToken<WebpackConfigurationTransform>(
  '[@angular-builders/custom-webpack] CustomWebpackConfigurationTransformFactory'
);

export const INDEX_HTML_TRANSFORM_TOKEN = new InjectionToken<IndexHtmlTransform>(
  '[@angular-builders/custom-webpack] IndexHtmlContext'
);

export const TRANSFORMS_TOKEN = new InjectionToken<Transforms>(
  '[@angular-builders/custom-webpack] Transforms'
);

export const WEBPACK_CONFIG_TRANSFORM: FactoryProvider = {
  provide: WEBPACK_CONFIG_TRANSFORM_TOKEN,
  useFactory: customWebpackConfigurationTransformFactory,
  deps: [CUSTOM_WEBPACK_SCHEMA_TOKEN, BUILD_CONTEXT_TOKEN],
};

export const INDEX_HTML_TRANSFORM: FactoryProvider = {
  provide: INDEX_HTML_TRANSFORM_TOKEN,
  useFactory: indexHtmlTransformFactory,
  deps: [CUSTOM_WEBPACK_SCHEMA_TOKEN, BUILD_CONTEXT_TOKEN],
};

export const TRANSFORMS: FactoryProvider = {
  provide: TRANSFORMS_TOKEN,
  useFactory: transformsFactory,
  deps: [
    CUSTOM_WEBPACK_SCHEMA_TOKEN,
    BUILD_CONTEXT_TOKEN,
    WEBPACK_CONFIG_TRANSFORM_TOKEN,
    INDEX_HTML_TRANSFORM_TOKEN,
  ],
};

export const TRANSFORMS_PROVIDERS: Provider[] = [WEBPACK_CONFIG_TRANSFORM, INDEX_HTML_TRANSFORM];
