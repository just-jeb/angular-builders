"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: [`${__dirname}/setup.js`],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png)$': `${__dirname}/mock-module.js`,
    },
};
//# sourceMappingURL=default-config.js.map