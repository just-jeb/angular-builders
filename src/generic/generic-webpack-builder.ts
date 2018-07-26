
import {Path, virtualFs} from '@angular-devkit/core';
import {Builder} from '@angular-devkit/architect';
import {BrowserBuilderSchema } from '@angular-devkit/build-angular';
import {Stats} from 'fs';
import {Configuration} from "webpack";

export class GenericWebpackBuilder {

  static buildWebpackConfig(
    targetBuilder: Builder<BrowserBuilderSchema> | undefined,
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<Stats>,
    browserOptions: any,
  ): Configuration | undefined {

    // If our target builder has a webpack config method lets use it. Otherwise we
    // will fall to the default config
    if (targetBuilder && typeof targetBuilder['buildWebpackConfig'] === 'function') {
      return targetBuilder['buildWebpackConfig'](
        root, projectRoot, host, browserOptions
      );
    }

    return;
  }
}
