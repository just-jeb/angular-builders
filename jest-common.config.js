module.exports = {
    globals: {
        "ts-jest": {
            diagnostics: false
        }
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "json"
    ],
    testEnvironment: "./jest-custom-environment"
};
