"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTimestamp = createTimestamp;
const architect_1 = require("@angular-devkit/architect");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const core_1 = require("@angular-devkit/core");
const fs_1 = require("fs");
const dateformat_1 = __importDefault(require("dateformat"));
function createTimestamp({ path, format }, { workspaceRoot, logger }) {
    const timestampFileName = `${(0, core_1.getSystemPath)((0, core_1.normalize)(workspaceRoot))}/${path}`;
    const writeFileObservable = (0, rxjs_1.bindNodeCallback)(fs_1.writeFile);
    const timestampLogger = logger.createChild('Timestamp');
    return writeFileObservable(timestampFileName, (0, dateformat_1.default)(new Date(), format)).pipe((0, operators_1.map)(() => ({ success: true })), (0, operators_1.tap)(() => timestampLogger.info('Timestamp created')), (0, operators_1.catchError)(e => {
        timestampLogger.error('Failed to create timestamp', e);
        return (0, rxjs_1.of)({ success: false });
    }));
}
exports.default = (0, architect_1.createBuilder)(createTimestamp);
//# sourceMappingURL=index.js.map