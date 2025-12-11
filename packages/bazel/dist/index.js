"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const bazelisk_1 = require("@bazel/bazelisk/bazelisk");
const ibazel_1 = require("@bazel/ibazel");
const child_process_1 = require("child_process");
async function _bazelBuilder(options, context) {
    const { bazelCommand, targetLabel, watch } = options;
    const binary = watch ? (0, ibazel_1.getNativeBinary)() : (0, bazelisk_1.getNativeBinary)();
    if (typeof binary !== 'string') {
        // this happens if no binary is located for the current platform
        context.logger.error('No Bazel binary detected');
        return { success: false };
    }
    else {
        try {
            const ps = (0, child_process_1.spawn)(binary, [bazelCommand, targetLabel], { stdio: 'inherit' });
            function shutdown() {
                ps.kill('SIGTERM');
            }
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
            return new Promise(resolve => {
                ps.on('close', e => resolve({ success: e === 0 }));
            });
        }
        catch (err) {
            context.logger.error(err.message);
            return { success: false };
        }
    }
}
exports.default = (0, architect_1.createBuilder)(_bazelBuilder);
//# sourceMappingURL=index.js.map