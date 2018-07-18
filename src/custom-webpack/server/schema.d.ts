/**
 * Created by Evgeny Barabanov on 01/07/2018.
 */

import {BuildWebpackServerSchema} from '@angular-devkit/build-angular/src/server/schema';

export interface CustomWebpackServerBuildSchema extends BuildWebpackServerSchema {
  webpackConfigPath?: string;
  mergeStrategy: { [key: string] : 'append' | 'prepend' | 'replace' }
}
