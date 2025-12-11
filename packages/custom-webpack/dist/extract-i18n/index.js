"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const build_angular_1 = require("@angular-devkit/build-angular");
const generic_browser_builder_1 = require("../generic-browser-builder");
exports.default = (0, architect_1.createBuilder)((0, generic_browser_builder_1.executeBrowserBasedBuilder)(build_angular_1.executeExtractI18nBuilder));
//# sourceMappingURL=index.js.map