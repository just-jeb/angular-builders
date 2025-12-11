"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCustomWebpackBrowser = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_angular_1 = require("@angular-devkit/build-angular");
const transform_factories_1 = require("../transform-factories");
const buildCustomWebpackBrowser = (options, context) => (0, build_angular_1.executeBrowserBuilder)(options, context, (0, transform_factories_1.getTransforms)(options, context));
exports.buildCustomWebpackBrowser = buildCustomWebpackBrowser;
exports.default = (0, architect_1.createBuilder)(exports.buildCustomWebpackBrowser);
//# sourceMappingURL=index.js.map