"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoots = getRoots;
exports.runJest = runJest;
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const node_1 = require("@angular-devkit/core/node");
const jest_1 = require("jest");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const custom_config_resolver_1 = require("./custom-config.resolver");
const default_config_resolver_1 = require("./default-config.resolver");
const jest_configuration_builder_1 = require("./jest-configuration-builder");
const options_converter_1 = require("./options-converter");
async function getRoots(context) {
    const registry = new core_1.schema.CoreSchemaRegistry();
    registry.addPostTransform(core_1.schema.transforms.addUndefinedDefaults);
    const { workspace } = await core_1.workspaces.readWorkspace((0, core_1.normalize)(context.workspaceRoot), core_1.workspaces.createWorkspaceHost(new node_1.NodeJsSyncHost()));
    const projectName = context.target
        ? context.target.project
        : workspace.extensions['defaultProject'];
    if (typeof projectName !== 'string') {
        throw new Error('Must either have a target from the context or a default project.');
    }
    const { root } = workspace.projects.get(projectName);
    return {
        projectRoot: (0, core_1.normalize)(root),
        workspaceRoot: (0, core_1.normalize)(context.workspaceRoot),
    };
}
function runJest(options, context) {
    //TODO: run with service worker (augmentAppWithServiceWorker)
    async function buildArgv() {
        const optionsConverter = new options_converter_1.OptionsConverter();
        const { workspaceRoot, projectRoot } = await getRoots(context);
        const builder = new jest_configuration_builder_1.JestConfigurationBuilder(new default_config_resolver_1.DefaultConfigResolver(options), new custom_config_resolver_1.CustomConfigResolver(options, context.logger.createChild('Jest runner')));
        const configuration = await builder.buildConfiguration(projectRoot, workspaceRoot, options.configPath);
        delete options.configPath;
        const argv = optionsConverter.convertToCliArgs(options);
        argv.push('--config', JSON.stringify(configuration));
        return argv;
    }
    async function runJestCLI() {
        const argv = await buildArgv();
        //TODO: use runCLI to better determine the outcome
        return (0, jest_1.run)(argv);
    }
    return (0, rxjs_1.from)(runJestCLI()).pipe((0, operators_1.map)(() => ({ success: true })));
}
exports.default = (0, architect_1.createBuilder)(runJest);
//# sourceMappingURL=index.js.map