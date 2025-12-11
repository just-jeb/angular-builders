"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePackagePath = resolvePackagePath;
const path_1 = require("path");
function resolvePackagePath(packageName, subPath) {
    try {
        const packageJsonPath = require.resolve(`${packageName}/package.json`);
        const packageDir = (0, path_1.dirname)(packageJsonPath);
        return (0, path_1.join)(packageDir, subPath);
    }
    catch (error) {
        console.error(`Failed to resolve path for package ${packageName}: ${error.message}`);
        process.exit(1);
    }
}
//# sourceMappingURL=package-utils.js.map