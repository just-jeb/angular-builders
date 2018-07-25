
import {Path, virtualFs} from '@angular-devkit/core';
import {Builder} from '@angular-devkit/architect';
import {BrowserBuilderSchema } from '@angular-devkit/build-angular';
import {Stats} from 'fs';

export class GenericWebpackBuilder {

  static buildWebpackConfig(
    targetBuilder: Builder<BrowserBuilderSchema> | undefined,
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<Stats>,
    browserOptions: BrowserBuilderSchema,
  ) {

    // If our target builder has a webpack config method lets use it. Otherwise we
    // will fall to the default config
    if (targetBuilder && targetBuilder['buildWebpackConfig'] instanceof Function) {
      return targetBuilder['buildWebpackConfig'](
        root, projectRoot, host, browserOptions
      );
    }

    return;
  }
}
