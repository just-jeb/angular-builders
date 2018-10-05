/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */

import {KarmaBuilderSchema} from '@angular-devkit/build-angular';
import {CustomWebpackSchema} from "../custom-webpack-schema";

export interface CustomWebpackKarmaBuildSchema extends KarmaBuilderSchema, CustomWebpackSchema {
}
