"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomWebpackBuilder = exports.defaultWebpackConfigPath = void 0;
const path = __importStar(require("node:path"));
const util_1 = require("util");
const core_1 = require("@angular-devkit/core");
const lodash_1 = require("lodash");
const common_1 = require("@angular-builders/common");
const webpack_config_merger_1 = require("./webpack-config-merger");
exports.defaultWebpackConfigPath = 'webpack.config.js';
class CustomWebpackBuilder {
    static async buildWebpackConfig(root, config, baseWebpackConfig, buildOptions, targetOptions, logger) {
        if (!config) {
            return baseWebpackConfig;
        }
        const normalizedRootPath = (0, core_1.getSystemPath)(root);
        const tsConfig = path.join(normalizedRootPath, buildOptions.tsConfig);
        const webpackConfigPath = path.join(normalizedRootPath, config.path || exports.defaultWebpackConfigPath);
        const configOrFactoryOrPromise = await (0, common_1.loadModule)(webpackConfigPath, tsConfig, logger);
        if (typeof configOrFactoryOrPromise === 'function') {
            // The exported function can return a new configuration synchronously
            // or return a promise that resolves to a new configuration.
            const finalWebpackConfig = await configOrFactoryOrPromise(baseWebpackConfig, buildOptions, targetOptions);
            logConfigProperties(config, finalWebpackConfig, logger);
            return finalWebpackConfig;
        }
        // The user can also export a promise that resolves to a `Configuration` object.
        // Suppose the following example:
        // `module.exports = new Promise(resolve => resolve({ ... }))`
        // This is valid both for promise and non-promise cases. If users export
        // a plain object, for instance, `module.exports = { ... }`, then it will
        // be wrapped into a promise and also `awaited`.
        const resolvedConfig = await configOrFactoryOrPromise;
        const finalWebpackConfig = (0, webpack_config_merger_1.mergeConfigs)(baseWebpackConfig, resolvedConfig, config.mergeRules, config.replaceDuplicatePlugins);
        logConfigProperties(config, finalWebpackConfig, logger);
        return finalWebpackConfig;
    }
}
exports.CustomWebpackBuilder = CustomWebpackBuilder;
function logConfigProperties(config, webpackConfig, logger) {
    // There's no reason to log the entire configuration object
    // since Angular's Webpack configuration is huge by default
    // and doesn't bring any meaningful context by being printed
    // entirely. Users can provide a list of properties they want to be logged.
    if (config.verbose?.properties) {
        for (const property of config.verbose.properties) {
            const value = (0, lodash_1.get)(webpackConfig, property);
            if (value) {
                const message = (0, util_1.inspect)(value, /* showHidden */ false, config.verbose.serializationDepth);
                logger.info(message);
            }
        }
    }
}
//# sourceMappingURL=custom-webpack-builder.js.map