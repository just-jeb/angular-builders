"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeConfigs = mergeConfigs;
const webpack_merge_1 = require("webpack-merge");
const lodash_1 = require("lodash");
const DEFAULT_MERGE_RULES = {
    module: {
        rules: {
            test: webpack_merge_1.CustomizeRule.Match,
            use: {
                loader: webpack_merge_1.CustomizeRule.Match,
                options: webpack_merge_1.CustomizeRule.Merge,
            },
        },
    },
};
function mergeConfigs(webpackConfig1, webpackConfig2, mergeRules = DEFAULT_MERGE_RULES, replacePlugins = false) {
    const mergedConfig = (0, webpack_merge_1.mergeWithRules)(mergeRules)(webpackConfig1, webpackConfig2);
    if (webpackConfig1.plugins && webpackConfig2.plugins) {
        const conf1ExceptConf2 = (0, lodash_1.differenceWith)(webpackConfig1.plugins, webpackConfig2.plugins, (item1, item2) => item1.constructor.name === item2.constructor.name);
        if (!replacePlugins) {
            const conf1ByName = (0, lodash_1.keyBy)(webpackConfig1.plugins, 'constructor.name');
            webpackConfig2.plugins = webpackConfig2.plugins.map(p => conf1ByName[p.constructor.name] ? (0, lodash_1.merge)(conf1ByName[p.constructor.name], p) : p);
        }
        mergedConfig.plugins = [...conf1ExceptConf2, ...webpackConfig2.plugins];
    }
    return mergedConfig;
}
//# sourceMappingURL=webpack-config-merger.js.map