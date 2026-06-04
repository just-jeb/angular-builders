import { SchemaObject as TimestampBuilderSchema } from './schema';
import { Builder, BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { Observable, bindNodeCallback, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { getSystemPath, normalize, json } from '@angular-devkit/core';
import { writeFile } from 'fs';

export function createTimestamp(
  { path, format }: TimestampBuilderSchema,
  { workspaceRoot, logger }: BuilderContext
): Observable<BuilderOutput> {
  const timestampFileName = `${getSystemPath(normalize(workspaceRoot))}/${path}`;
  const writeFileObservable = bindNodeCallback(writeFile);
  const timestampLogger = logger.createChild('Timestamp');
  // dateformat v5 is ESM-only; dynamic import() avoids require() which cannot load ESM.
  return from(import('dateformat')).pipe(
    switchMap(({ default: dateFormat }) =>
      writeFileObservable(timestampFileName, dateFormat(new Date(), format)).pipe(
        map(() => ({ success: true })),
        tap(() => timestampLogger.info('Timestamp created')),
        catchError(e => {
          timestampLogger.error('Failed to create timestamp', e);
          return of({ success: false });
        })
      )
    )
  );
}

// Explicit Builder<T> annotation (not inferred): newer @angular-devkit dep trees nest a second
// copy of @angular-devkit/core under @angular-devkit/architect, which makes the inferred default
// export type non-portable (TS2742). Naming the type from @angular-devkit/architect avoids it.
const timestampBuilder: Builder<json.JsonObject & TimestampBuilderSchema> =
  createBuilder(createTimestamp);
export default timestampBuilder;
