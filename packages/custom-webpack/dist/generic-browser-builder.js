"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeBrowserBasedBuilder = void 0;
const architect_1 = require("@angular-devkit/architect");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const transform_factories_1 = require("./transform-factories");
const executeBrowserBasedBuilder = (executebBuilder) => (options, context) => {
    async function setup() {
        const browserTarget = (0, architect_1.targetFromTargetString)(options.buildTarget);
        return context.getTargetOptions(browserTarget);
    }
    return (0, rxjs_1.from)(setup()).pipe((0, operators_1.switchMap)(customWebpackOptions => executebBuilder(options, context, (0, transform_factories_1.getTransforms)(customWebpackOptions, context))));
};
exports.executeBrowserBasedBuilder = executeBrowserBasedBuilder;
//# sourceMappingURL=generic-browser-builder.js.map