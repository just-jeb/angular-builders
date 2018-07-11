/**
 * Created by Evgeny Barabanov on 01/07/2018.
 */

import {BuildWebpackServerSchema} from '@angular-devkit/build-angular/src/server/schema';

export interface CustomWebpackDevServerBuildSchema extends BuildWebpackServerSchema {
  webpackConfigPath?: string;
}
