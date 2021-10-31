import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import {getNativeBinary as bazeliskBin} from '@bazel/bazelisk/bazelisk';
import {getNativeBinary as ibazelBin} from '@bazel/ibazel';
import {spawn} from 'child_process';
import {Schema} from './schema';

async function _bazelBuilder(
    options: JsonObject&Schema,
    context: BuilderContext,
    ): Promise<BuilderOutput> {
  const {bazelCommand, targetLabel, watch} = options;
  const binary = watch ? ibazelBin() : bazeliskBin();
  if (typeof binary !== 'string') {
    // this happens if no binary is located for the current platform
    return {success: false};
  } else {
    try {
      const ps = spawn(binary, [bazelCommand, targetLabel], {stdio: 'inherit'});

      function shutdown() {
        ps.kill('SIGTERM');
      }

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      return new Promise(resolve => {
        ps.on('close', e => resolve({success: e === 0}));
      });
    } catch (err) {
      context.logger.error(err.message);
      return {success: false};
    }
  }
}

export default createBuilder(_bazelBuilder);
