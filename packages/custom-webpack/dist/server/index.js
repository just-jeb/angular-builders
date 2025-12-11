"use strict";
/**
 * Created by Evgeny Barabanov on 28/06/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCustomWebpackServer = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_angular_1 = require("@angular-devkit/build-angular");
const transform_factories_1 = require("../transform-factories");
const buildCustomWebpackServer = (options, context) => (0, build_angular_1.executeServerBuilder)(options, context, {
    webpackConfiguration: (0, transform_factories_1.customWebpackConfigTransformFactory)(options, context),
});
exports.buildCustomWebpackServer = buildCustomWebpackServer;
exports.default = (0, architect_1.createBuilder)(exports.buildCustomWebpackServer);
//# sourceMappingURL=index.js.map