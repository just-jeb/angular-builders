"use strict";
/**
 * Created by Evgeny Barabanov on 05/10/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCustomWebpackKarma = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_angular_1 = require("@angular-devkit/build-angular");
const transform_factories_1 = require("../transform-factories");
const buildCustomWebpackKarma = (options, context) => (0, build_angular_1.executeKarmaBuilder)(options, context, {
    webpackConfiguration: (0, transform_factories_1.customWebpackConfigTransformFactory)(options, context),
});
exports.buildCustomWebpackKarma = buildCustomWebpackKarma;
exports.default = (0, architect_1.createBuilder)(exports.buildCustomWebpackKarma);
//# sourceMappingURL=index.js.map