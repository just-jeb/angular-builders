import {getSystemPath, join, Path} from "@angular-devkit/core";
import defaultConfig from "./jest-config/default-config";

export const testPattern = `/**/+(*.)+(spec|test).+(ts|js)?(x)`;
export const tsConfigName = 'tsconfig.spec.json';
export const jestPresetRootPath = `node_modules/jest-preset-angular`;
export const snapshotSerializer = 'AngularSnapshotSerializer.js';
export const htmlCommentSerializer = 'HTMLCommentSerializer.js';

export class DefaultConfigResolver {

  resolveGlobal(workspaceRoot: Path): any {
    const jestPresetFullPath = join(workspaceRoot, jestPresetRootPath);
    return {...defaultConfig,
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
          tsConfig: getSystemPath(join(projectRoot, tsConfigName))
        }
      },
      testMatch: [
        `${getSystemPath(join(projectRoot, testPattern))}`
      ]
    };
  }
}