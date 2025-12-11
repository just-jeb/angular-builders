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
exports.getTransforms = exports.indexHtmlTransformFactory = exports.customWebpackConfigTransformFactory = void 0;
const path = __importStar(require("node:path"));
const core_1 = require("@angular-devkit/core");
const common_1 = require("@angular-builders/common");
const custom_webpack_builder_1 = require("./custom-webpack-builder");
const customWebpackConfigTransformFactory = (options, { workspaceRoot, target, logger }) => browserWebpackConfig => {
    return custom_webpack_builder_1.CustomWebpackBuilder.buildWebpackConfig((0, core_1.normalize)(workspaceRoot), options.customWebpackConfig, browserWebpackConfig, options, target, logger);
};
exports.customWebpackConfigTransformFactory = customWebpackConfigTransformFactory;
const indexHtmlTransformFactory = (options, { workspaceRoot, target, logger }) => {
    if (!options.indexTransform)
        return null;
    const transformPath = path.join((0, core_1.getSystemPath)((0, core_1.normalize)(workspaceRoot)), options.indexTransform);
    const tsConfig = path.join((0, core_1.getSystemPath)((0, core_1.normalize)(workspaceRoot)), options.tsConfig);
    return async (indexHtml) => {
        const transform = await (0, common_1.loadModule)(transformPath, tsConfig, logger);
        return transform(target, indexHtml);
    };
};
exports.indexHtmlTransformFactory = indexHtmlTransformFactory;
const getTransforms = (options, context) => ({
    webpackConfiguration: (0, exports.customWebpackConfigTransformFactory)(options, context),
    indexHtml: (0, exports.indexHtmlTransformFactory)(options, context),
});
exports.getTransforms = getTransforms;
//# sourceMappingURL=transform-factories.js.map