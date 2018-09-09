import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {bindNodeCallback, Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {TimestampBuilderSchema} from './schema';
import {getSystemPath} from '@angular-devkit/core';
import {writeFile} from 'fs';
import * as dateFormat from 'dateformat';

export default class TimestampBuilder implements Builder<TimestampBuilderSchema> {
  constructor(private context: BuilderContext) {
  }

  run(builderConfig: BuilderConfiguration<Partial<TimestampBuilderSchema>>): Observable<BuildEvent> {
    const root = this.context.workspace.root;
    const {path, format} = builderConfig.options;
    const timestampFileName = `${getSystemPath(root)}/${path}`;
    const writeFileObservable = bindNodeCallback(writeFile);
    return writeFileObservable(timestampFileName, dateFormat(new Date(), format)).pipe(
      map(() => ({success: true})),
      tap(() => this.context.logger.info("Timestamp created")),
      catchError(e => {
        this.context.logger.error("Failed to create timestamp", e);
        return of({success: false});
      })
    );
  }

}
