"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConfigResolver = exports.testPattern = void 0;
const lodash_1 = require("lodash");
const core_1 = require("@angular-devkit/core");
const utils_1 = require("./utils");
const default_config_1 = __importDefault(require("./jest-config/default-config"));
exports.testPattern = `/**/*(*.)@(spec|test).[tj]s?(x)`;
const globalMocks = {
    getComputedStyle: 'computed-style.js',
    doctype: 'doctype.js',
    matchMedia: 'match-media.js',
    styleTransform: 'style-transform.js',
};
const getMockFiles = (enabledMocks = []) => Object.values((0, lodash_1.pick)(globalMocks, enabledMocks)).map(fileName => (0, core_1.getSystemPath)((0, core_1.normalize)(`${__dirname}/global-mocks/${fileName}`)));
class DefaultConfigResolver {
    options;
    // Exposed publicly for testing purposes.
    tsJestTransformRegExp = '^.+\\.(ts|js|mjs|html|svg)$';
    constructor(options) {
        this.options = options;
    }
    resolveGlobal() {
        const setupFilesAfterEnv = [
            ...default_config_1.default.setupFilesAfterEnv,
            ...getMockFiles(this.options.globalMocks),
        ];
        return { ...default_config_1.default, setupFilesAfterEnv };
    }
    resolveForProject(projectRoot) {
        return {
            testMatch: [`${(0, core_1.getSystemPath)(projectRoot)}${exports.testPattern}`],
            transform: {
                [this.tsJestTransformRegExp]: [
                    'jest-preset-angular',
                    {
                        // see: jest-preset-angular defaultTransformerOptions https://github.com/thymikee/jest-preset-angular/blob/main/src/presets/index.ts#L11
                        stringifyContentPathRegex: '\\.(html|svg)$',
                        // Join with the default `tsConfigName` if the `tsConfig` option is not provided
                        tsconfig: (0, utils_1.getTsConfigPath)(projectRoot, this.options),
                    },
                ],
            },
        };
    }
}
exports.DefaultConfigResolver = DefaultConfigResolver;
//# sourceMappingURL=default-config.resolver.js.map