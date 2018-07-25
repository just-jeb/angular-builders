import {WebpackConfigMerger} from "./webpack-config-merger";
import * as webpack from "webpack";

describe('Webpack config merger test', () => {
	it('Should replace plugins', () => {
		const plugin1 = new webpack.HotModuleReplacementPlugin({
			multiStep: true,
			fullBuildTimeout: 3000,
			requestTimeout: 1000
		});
		const plugin2 = new webpack.HotModuleReplacementPlugin({
			multiStep: false,
			requestTimeout: 500
		});

		const output = WebpackConfigMerger.merge({
			plugins: [plugin1]
		}, {
			plugins: [plugin2]
		}, {}, true);

		const expected = {
			plugins: [plugin2]
		};

		expect(output).toEqual(expected);
	});

	it('Should append plugins', () => {
		const plugin1 = new webpack.HotModuleReplacementPlugin();
		const plugin2 = new webpack.ContextReplacementPlugin('1');

		const output = WebpackConfigMerger.merge({
			plugins: [plugin1]
		}, {
			plugins: [plugin2]
		});

		const expected = {
			plugins: [plugin1, plugin2]
		};

		expect(output).toEqual(expected);
	});

	it('Should not replace anything if there are no duplicates', () => {
		const plugin1 = new webpack.HotModuleReplacementPlugin();
		const plugin2 = new webpack.ContextReplacementPlugin('1');

		const output = WebpackConfigMerger.merge({
			plugins: [plugin1]
		}, {
			plugins: [plugin2]
		}, {}, true);

		const expected = {
			plugins: [plugin1, plugin2]
		};

		expect(output).toEqual(expected);
	});

	it('Should replace plugins while working properly with other strategies', () => {
		const plugin1 = new webpack.HotModuleReplacementPlugin({
			multiStep: true,
			fullBuildTimeout: 3000,
			requestTimeout: 1000
		});
		const plugin2 = new webpack.HotModuleReplacementPlugin({
			multiStep: false,
			requestTimeout: 500
		});

		const output = WebpackConfigMerger.merge({
			externals: ['a', 'b'],
			plugins: [plugin1]
		}, {
			externals: ['c', 'd'],
			plugins: [plugin2]
		}, {'externals': 'prepend'}, true);


		const expected = {
			externals: ['c', 'd', 'a', 'b'],
			plugins: [plugin2]
		};

		expect(output).toEqual(expected);
	});
});