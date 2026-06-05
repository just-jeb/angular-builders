import { createBuilder } from '@angular-devkit/architect';
import { DevServerBuilderOptions, executeDevServerBuilder } from '@angular-devkit/build-angular';
import { json } from '@angular-devkit/core';
import { executeBrowserBasedBuilder } from '../generic-browser-builder';

export default createBuilder<DevServerBuilderOptions & json.JsonObject>(
  executeBrowserBasedBuilder(executeDevServerBuilder)
);
