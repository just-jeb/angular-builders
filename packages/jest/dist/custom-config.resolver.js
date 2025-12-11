"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomConfigResolver = void 0;
const fs_1 = require("fs");
const core_1 = require("@angular-devkit/core");
const common_1 = require("@angular-builders/common");
const utils_1 = require("./utils");
class CustomConfigResolver {
    options;
    logger;
    // https://jestjs.io/docs/configuration
    allowedExtensions = ['js', 'ts', 'mjs', 'cjs', 'json'];
    constructor(options, logger) {
        this.options = options;
        this.logger = logger;
    }
    async resolveGlobal(workspaceRoot) {
        const packageJsonPath = (0, core_1.getSystemPath)((0, core_1.join)(workspaceRoot, 'package.json'));
        const packageJson = require(packageJsonPath);
        if (packageJson.jest) {
            return packageJson.jest;
        }
        const tsConfig = (0, utils_1.getTsConfigPath)(workspaceRoot, this.options);
        const workspaceJestConfigPaths = this.allowedExtensions.map(extension => (0, core_1.getSystemPath)((0, core_1.join)(workspaceRoot, `jest.config.${extension}`)));
        const workspaceJestConfigPath = workspaceJestConfigPaths.find(path => (0, fs_1.existsSync)(path));
        if (!workspaceJestConfigPath) {
            return {};
        }
        return await (0, common_1.loadModule)(workspaceJestConfigPath, tsConfig, this.logger);
    }
    async resolveForProject(projectRoot, configPath) {
        const jestConfigPath = (0, core_1.getSystemPath)((0, core_1.join)(projectRoot, configPath));
        if (!(0, fs_1.existsSync)(jestConfigPath)) {
            this.logger.warn(`warning: unable to locate custom jest configuration file at path "${jestConfigPath}"`);
            return {};
        }
        const tsConfig = (0, utils_1.getTsConfigPath)(projectRoot, this.options);
        return await (0, common_1.loadModule)(jestConfigPath, tsConfig, this.logger);
    }
}
exports.CustomConfigResolver = CustomConfigResolver;
//# sourceMappingURL=custom-config.resolver.js.map