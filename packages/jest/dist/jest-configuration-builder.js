"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JestConfigurationBuilder = void 0;
const core_1 = require("@angular-devkit/core");
const lodash_1 = require("lodash");
/**
 * A whitelist of property names that are meant to be concat.
 */
const ARRAY_PROPERTIES_TO_CONCAT = [
    // From Jest Config
    'setupFilesAfterEnv',
    // From ts-jest config
    'astTransformers',
];
/**
 * This function checks witch properties should be concat. Early return will
 * merge the data as lodash#merge would do it.
 */
function concatArrayProperties(objValue, srcValue, property) {
    if (!ARRAY_PROPERTIES_TO_CONCAT.includes(property)) {
        return;
    }
    if (!(0, lodash_1.isArray)(objValue)) {
        return (0, lodash_1.mergeWith)(objValue, srcValue, (obj, src) => {
            if ((0, lodash_1.isArray)(obj)) {
                return obj.concat(src);
            }
        });
    }
    return objValue.concat(srcValue);
}
const buildConfiguration = async (defaultConfigResolver, customConfigResolver, projectRoot, workspaceRoot, configPath = 'jest.config.js') => {
    const globalDefaultConfig = defaultConfigResolver.resolveGlobal();
    const projectDefaultConfig = defaultConfigResolver.resolveForProject(projectRoot);
    const globalCustomConfig = await customConfigResolver.resolveGlobal(workspaceRoot);
    const projectCustomConfig = await customConfigResolver.resolveForProject(projectRoot, configPath);
    return (0, lodash_1.mergeWith)(globalDefaultConfig, projectDefaultConfig, globalCustomConfig, projectCustomConfig, concatArrayProperties);
};
class JestConfigurationBuilder {
    defaultConfigResolver;
    customConfigResolver;
    constructor(defaultConfigResolver, customConfigResolver) {
        this.defaultConfigResolver = defaultConfigResolver;
        this.customConfigResolver = customConfigResolver;
    }
    async buildConfiguration(projectRoot, workspaceRoot, configPath = 'jest.config.js') {
        const pathToProject = (0, core_1.resolve)(workspaceRoot, projectRoot);
        return await buildConfiguration(this.defaultConfigResolver, this.customConfigResolver, pathToProject, workspaceRoot, configPath);
    }
}
exports.JestConfigurationBuilder = JestConfigurationBuilder;
//# sourceMappingURL=jest-configuration-builder.js.map