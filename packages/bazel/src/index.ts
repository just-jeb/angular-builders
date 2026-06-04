import { Builder, BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import type { JsonObject } from '@angular-devkit/core';
import { getNativeBinary as bazeliskBin } from '@bazel/bazelisk/bazelisk';
import { getNativeBinary as ibazelBin } from '@bazel/ibazel';
import { spawn } from 'child_process';
import { Schema } from './schema';

async function _bazelBuilder(
  options: JsonObject & Schema,
  context: BuilderContext
): Promise<BuilderOutput> {
  const { bazelCommand, targetLabel, watch } = options;
  const binary = watch ? ibazelBin() : bazeliskBin();
  if (typeof binary !== 'string') {
    // this happens if no binary is located for the current platform
    context.logger.error('No Bazel binary detected');
    return { success: false };
  } else {
    try {
      const ps = spawn(binary, [bazelCommand, targetLabel], { stdio: 'inherit' });

      function shutdown() {
        ps.kill('SIGTERM');
      }

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      return new Promise(resolve => {
        ps.on('close', e => resolve({ success: e === 0 }));
      });
    } catch (err: any) {
      context.logger.error(err.message);
      return { success: false };
    }
  }
}

// Explicit Builder<T> annotation (not inferred): some @angular-devkit dep trees nest a second
// copy of @angular-devkit/core under @angular-devkit/architect, making the inferred default
// export type non-portable (TS2742). Naming the type from @angular-devkit/architect avoids it.
const builder: Builder<JsonObject & Schema> = createBuilder(_bazelBuilder);
export default builder;
