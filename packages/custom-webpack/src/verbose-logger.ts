import { isString, get } from 'lodash';
import { Configuration } from 'webpack';
import { LoggerApi } from '@angular-devkit/core/src/logger';

import { CustomWebpackBuilderVerboseConfig } from './custom-webpack-builder-config';

export interface VerboseLogger {
  logFinalConfig(config: Configuration): void;
}

export function createVerboseLogger(
  verbose: CustomWebpackBuilderVerboseConfig | undefined,
  logger: LoggerApi
): VerboseLogger {
  const properties = getLoggableProperties(verbose);
  const verboseLogger = logger.createChild('verbose');

  return {
    logFinalConfig(config: Configuration) {
      for (const property of properties) {
        const value = get(config, property);
        if (value) {
          verboseLogger.log('info', value);
        }
      }
    },
  };
}

function getLoggableProperties(verbose: CustomWebpackBuilderVerboseConfig | undefined): string[] {
  if (isString(verbose.properties)) {
    verbose.properties = [verbose.properties];
  }

  return Array.isArray(verbose.properties) ? verbose.properties : [];
}
