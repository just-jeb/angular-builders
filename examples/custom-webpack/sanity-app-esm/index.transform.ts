import { TargetOptions } from '@angular-builders/custom-webpack';

export default async (options: TargetOptions, indexhtml: string): Promise<string> => {
  const { default: transformFromEsm } = await import('./index.transform.js');
  return transformFromEsm(options, indexhtml);
};
