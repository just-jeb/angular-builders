/**
 * Created by Evgeny Barabanov on 01/07/2018.
 */

import {BuildWebpackServerSchema} from '@angular-devkit/build-angular/src/server/schema';
import {CustomWebpackSchema} from "../custom-webpack-schema";

export interface CustomWebpackServerBuildSchema extends BuildWebpackServerSchema, CustomWebpackSchema {

}
