/**
 * Created by Evgeny Barabanov on 01/07/2018.
 */

import { BrowserBuilderSchema } from '@angular-devkit/build-angular';

export interface CustomWebpackDevServerBuildSchema extends BrowserBuilderSchema {
  webpackConfigPath?: string;
}
