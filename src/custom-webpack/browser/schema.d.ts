/**
 * Created by Evgeny Barabanov on 01/07/2018.
 */

import {BrowserBuilderSchema} from '@angular-devkit/build-angular';
import {CustomWebpackSchema} from "../custom-webpack-schema";

export interface CustomWebpackBrowserBuildSchema extends BrowserBuilderSchema, CustomWebpackSchema {
}
