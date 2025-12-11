"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsConfigName = void 0;
exports.getTsConfigPath = getTsConfigPath;
const core_1 = require("@angular-devkit/core");
exports.tsConfigName = 'tsconfig.spec.json';
function getTsConfigPath(projectRoot, options) {
    return (0, core_1.getSystemPath)((0, core_1.join)(projectRoot, options.tsConfig || exports.tsConfigName));
}
//# sourceMappingURL=utils.js.map