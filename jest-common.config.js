module.exports = {
    globals: {
        "ts-jest": {
            skipBabel: true,
            enableTsDiagnostics: false
        }
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js"
    ],
    testEnvironment: "node"
};
