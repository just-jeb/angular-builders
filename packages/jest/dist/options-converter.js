"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsConverter = void 0;
class OptionsConverter {
    convertToCliArgs(options) {
        const argv = [];
        let nonFlagArgs;
        for (const option of Object.keys(options)) {
            let optionValue = options[option];
            if (option == '--') {
                nonFlagArgs = optionValue.join(' ');
            }
            else if (optionValue === true) {
                argv.push(`--${option}`);
            }
            else if (typeof optionValue === 'string' || typeof optionValue === 'number') {
                argv.push(`--${option}=${optionValue}`);
            }
            else if (Array.isArray(optionValue)) {
                for (const item of optionValue) {
                    argv.push(`--${option}=${item}`);
                }
            }
        }
        if (nonFlagArgs) {
            argv.push(nonFlagArgs);
        }
        return argv;
    }
}
exports.OptionsConverter = OptionsConverter;
//# sourceMappingURL=options-converter.js.map