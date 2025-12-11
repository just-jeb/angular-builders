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
exports.executeCustomEsbuildUnitTestBuilder = executeCustomEsbuildUnitTestBuilder;
const path = __importStar(require("node:path"));
const architect_1 = require("@angular-devkit/architect");
const build_1 = require("@angular/build");
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const load_plugins_1 = require("../load-plugins");
function executeCustomEsbuildUnitTestBuilder(options, context) {
    if (Array.isArray(options.browsers) && !options.browsers.length) {
        delete options.browsers;
    }
    const buildTarget = (0, architect_1.targetFromTargetString)(options.buildTarget);
    async function getBuildTargetOptions() {
        return (await context.getTargetOptions(buildTarget));
    }
    const workspaceRoot = (0, core_1.getSystemPath)((0, core_1.normalize)(context.workspaceRoot));
    const tsConfig = path.join(workspaceRoot, options.tsConfig);
    return (0, rxjs_1.from)(getBuildTargetOptions()).pipe((0, rxjs_1.switchMap)(async (buildOptions) => {
        const codePlugins = await (0, load_plugins_1.loadPlugins)(buildOptions.plugins, workspaceRoot, tsConfig, context.logger, options, context.target);
        return { codePlugins };
    }), (0, rxjs_1.switchMap)(extensions => (0, build_1.executeUnitTestBuilder)({ ...options, runner: 'vitest' }, context, extensions)));
}
exports.default = (0, architect_1.createBuilder)(executeCustomEsbuildUnitTestBuilder);
//# sourceMappingURL=index.js.map