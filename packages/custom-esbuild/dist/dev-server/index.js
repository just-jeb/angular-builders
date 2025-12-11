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
exports.executeCustomDevServerBuilder = executeCustomDevServerBuilder;
const path = __importStar(require("node:path"));
const architect_1 = require("@angular-devkit/architect");
const build_1 = require("@angular/build");
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const common_1 = require("@angular-builders/common");
const load_plugins_1 = require("../load-plugins");
const patch_builder_context_1 = require("./patch-builder-context");
const load_index_html_transformer_1 = require("../load-index-html-transformer");
function executeCustomDevServerBuilder(options, context) {
    const buildTarget = (0, architect_1.targetFromTargetString)(options.buildTarget);
    async function getBuildTargetOptions() {
        return (await context.getTargetOptions(buildTarget));
    }
    const workspaceRoot = (0, core_1.getSystemPath)((0, core_1.normalize)(context.workspaceRoot));
    return (0, rxjs_1.from)(getBuildTargetOptions()).pipe((0, rxjs_1.switchMap)(async (buildOptions) => {
        const tsConfig = path.join(workspaceRoot, buildOptions.tsConfig);
        const middleware = [];
        // Not using `Promise.all` preserves the order of middlewares as they
        // are declared in the configuration list.
        for (const middlewarePath of options.middlewares || []) {
            // https://github.com/angular/angular-cli/pull/26212/files#diff-a99020cbdb97d20b2bc686bcb64b31942107d56db06fd880171b0a86f7859e6eR52
            middleware.push(await (0, common_1.loadModule)(path.join(workspaceRoot, middlewarePath), tsConfig, context.logger));
        }
        const buildPlugins = await (0, load_plugins_1.loadPlugins)(buildOptions.plugins, workspaceRoot, tsConfig, context.logger, options, context.target);
        const indexHtmlTransformer = buildOptions.indexHtmlTransformer
            ? await (0, load_index_html_transformer_1.loadIndexHtmlTransformer)(path.join(workspaceRoot, buildOptions.indexHtmlTransformer), tsConfig, context.logger, context.target)
            : undefined;
        (0, patch_builder_context_1.patchBuilderContext)(context, buildTarget);
        return { middleware, buildPlugins, indexHtmlTransformer };
    }), (0, rxjs_1.switchMap)((extensions) => (0, build_1.executeDevServerBuilder)(options, context, extensions)));
}
exports.default = (0, architect_1.createBuilder)(executeCustomDevServerBuilder);
//# sourceMappingURL=index.js.map