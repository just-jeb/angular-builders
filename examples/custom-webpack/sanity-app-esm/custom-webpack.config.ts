import type { Configuration } from 'webpack';

export default async (cfg: Configuration) => {
  const { default: configFromEsm } = await import('./custom-webpack.config.js');
  // Do some stuff with config and configFromEsm
  return { ...cfg, ...configFromEsm };
};
