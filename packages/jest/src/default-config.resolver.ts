import {getSystemPath, join, Path} from "@angular-devkit/core";
import defaultConfig from "./jest-config/default-config";

export const testPattern = `/**/+(*.)+(spec|test).+(ts|js)?(x)`;
export const tsConfigName = 'tsconfig.spec.json';
export const jestPresetRootPath = `node_modules/jest-preset-angular`;
export const preprocessor = 'preprocessor.js';
export const snapshotSerializer = 'AngularSnapshotSerializer.js';
export const htmlCommentSerializer = 'HTMLCommentSerializer.js';
export const transformRegex = '^.+\\.(ts|js|html)$';

export class DefaultConfigResolver {

  resolveGlobal(workspaceRoot: Path): any {
    const jestPresetFullPath = join(workspaceRoot, jestPresetRootPath);
    return {...defaultConfig,
      transform: {
       [transformRegex] : getSystemPath(join(jestPresetFullPath, preprocessor))
      },
      snapshotSerializers: [
        getSystemPath(join(jestPresetFullPath, snapshotSerializer)),
        getSystemPath(join(jestPresetFullPath, htmlCommentSerializer))
      ]
    };
  }

  resolveForProject(projectRoot: Path): any {
    return {
      globals: {
        'ts-jest': {
          tsConfigFile: getSystemPath(join(projectRoot, tsConfigName))
        }
      },
      testMatch: [
        `${getSystemPath(join(projectRoot, testPattern))}`
      ]
    };
  }
}