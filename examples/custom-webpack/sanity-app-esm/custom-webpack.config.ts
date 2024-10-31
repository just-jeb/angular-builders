import type { Configuration } from 'webpack';

import { WebpackEsmPlugin } from 'webpack-esm-plugin';

export default async (cfg: Configuration) => {
  const { default: configFromEsm } = await import('./custom-webpack.config.js');

  // This is used to ensure we fixed the following issue:
  // https://github.com/just-jeb/angular-builders/issues/1213
  cfg.plugins!.push(new WebpackEsmPlugin());

  // Do some stuff with config and configFromEsm
  return { ...cfg, ...configFromEsm };
};
