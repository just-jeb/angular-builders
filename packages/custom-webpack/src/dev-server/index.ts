import { createBuilder } from '@angular-devkit/architect';
import { DevServerBuilderOptions, executeDevServerBuilder } from '@angular-devkit/build-angular';
import { executeBrowserBasedBuilder } from '../generic-browser-builder';

export default createBuilder<DevServerBuilderOptions>(
  executeBrowserBasedBuilder(executeDevServerBuilder)
);
