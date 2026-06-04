import { Builder, createBuilder } from '@angular-devkit/architect';
import { DevServerBuilderOptions, executeDevServerBuilder } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { executeBrowserBasedBuilder } from '../generic-browser-builder';

// Explicit Builder<T> annotation (not inferred): some @angular-devkit dep trees nest a second
// copy of @angular-devkit/core under @angular-devkit/architect, making the inferred default
// export type non-portable (TS2742). Naming the type from @angular-devkit/architect avoids it.
const builder: Builder<DevServerBuilderOptions & json.JsonObject> = createBuilder<
  DevServerBuilderOptions & json.JsonObject
>(executeBrowserBasedBuilder(executeDevServerBuilder));
export default builder;
