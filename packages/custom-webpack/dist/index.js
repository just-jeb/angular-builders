"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Evgeny Barabanov on 01/07/2018.
 */
__exportStar(require("./browser"), exports);
__exportStar(require("./karma"), exports);
__exportStar(require("./server"), exports);
__exportStar(require("./dev-server"), exports);
__exportStar(require("./extract-i18n"), exports);
__exportStar(require("./transform-factories"), exports);
__exportStar(require("./generic-browser-builder"), exports);
//# sourceMappingURL=index.js.map