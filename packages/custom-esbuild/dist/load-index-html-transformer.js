"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadIndexHtmlTransformer = loadIndexHtmlTransformer;
const common_1 = require("@angular-builders/common");
async function loadIndexHtmlTransformer(indexHtmlTransformerPath, tsConfig, logger, target) {
    const transformer = await (0, common_1.loadModule)(indexHtmlTransformerPath, tsConfig, logger);
    return (indexHtml) => transformer(indexHtml, target);
}
//# sourceMappingURL=load-index-html-transformer.js.map