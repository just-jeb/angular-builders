import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {JestBuilderSchema} from "./schema";
import {getSystemPath} from "@angular-devkit/core";
import {existsSync} from 'fs';
import defaultConfig from './default-config';
import {merge} from 'lodash';

const defaultJestPath = 'jest.config.js';
const jest = require('jest');

export default class JestBuilder implements Builder<JestBuilderSchema> {
	constructor(private context: BuilderContext) {
	}


	run(builderConfig: BuilderConfiguration<Partial<JestBuilderSchema>>): Observable<BuildEvent> {
		const {options, root} = builderConfig;
		let argv: any[] = [];
		for (const option of Object.keys(options)) {
			if (options[option] === true) argv.push(`--${option}`)
		}
		let customConfig = {};
		const packageJson = require(`${getSystemPath(root)}/package.json`);
		const jestConfigPath = `${getSystemPath(root)}/${options.configPath || defaultJestPath}`;
		if (packageJson.jest) {
			customConfig = packageJson.jest;
		} else if (existsSync(jestConfigPath)) {
			customConfig = require(jestConfigPath);
		}
		//TODO: add jest config property to schema?
		argv.push('--config', JSON.stringify(merge(defaultConfig, customConfig)));

		return of({success: true}).pipe(tap(() => jest.run(argv)), catchError(err => of({success: false})));
	}

}
