import {Builder, BuilderConfiguration, BuildEvent} from '@angular-devkit/architect';
import {Observable} from 'rxjs';

export default class JestBuilder implements Builder<any> {
	run(builderConfig: BuilderConfiguration<Partial<any>>): Observable<BuildEvent> {
		return undefined;
	}

}
