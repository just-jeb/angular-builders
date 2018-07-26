import {GenericWebpackBuilder} from './generic-webpack-builder';
import {Path, virtualFs} from '@angular-devkit/core';
import {Builder} from '@angular-devkit/architect';
import {BrowserBuilderSchema} from '@angular-devkit/build-angular';
import {Stats} from 'fs';

describe('GenericWebpackBuilder test', () => {

	const mockRoot = <Path> 'mockRoot';
	const mockProjectRoot = <Path> 'mockProjectRoot';
	const mockHost = <virtualFs.Host<Stats>> <any> 'mockHost';
	const mockBrowserOptions = <BrowserBuilderSchema> <any> 'mockBrowserOptions';

	it('should invoke the target builder when the target has the buildWebpackConfig method', () => {
		const mockTarget: { buildWebpackConfig(): any } & Builder<BrowserBuilderSchema> = {
			buildWebpackConfig: jest.fn(() => 'mockConfig'),
			run: jest.fn()
		};

		const result = GenericWebpackBuilder.buildWebpackConfig(mockTarget, mockRoot, mockProjectRoot, mockHost, mockBrowserOptions);

		expect(result).toBe('mockConfig');
		expect(mockTarget.buildWebpackConfig).toHaveBeenCalledWith('mockRoot', 'mockProjectRoot', 'mockHost', 'mockBrowserOptions');

	});

	it('should not invoke the target builder when the target does not have the buildWebpackConfig method', () => {
		const mockTarget: { anyOtherMethod(): any } & Builder<BrowserBuilderSchema> = {
			anyOtherMethod: jest.fn(),
			run: jest.fn()
		};

		const result = GenericWebpackBuilder.buildWebpackConfig(mockTarget, mockRoot, mockProjectRoot, mockHost, mockBrowserOptions);

		expect(result).toBeUndefined();
		expect(mockTarget.anyOtherMethod).not.toHaveBeenCalled();
	});

	it('should not blow up if the target builder is null', () => {

		const result = GenericWebpackBuilder.buildWebpackConfig(undefined, mockRoot, mockProjectRoot, mockHost, mockBrowserOptions);

		expect(result).toBeUndefined()
	});
});
