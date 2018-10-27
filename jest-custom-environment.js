const NodeEnvironment = require('jest-environment-node');


const originalPrepareStackTrace = Error.prepareStackTrace;
const originalError = Error;


class JestCustomEnvironment extends NodeEnvironment {
    constructor(config){
        super(config);

    }

    async setup(){
        await super.setup();
        // Return array of CallSites instead of string
        // callsites package does the same, but as we are replacing the original Error with Jest's Error,
        // callsites' replacement won't affect the original V8 Error
        Error.prepareStackTrace = (_, stack) => stack;
        // Workaround for this bug https://github.com/facebook/jest/issues/2549
        Error = this.global.Error;
    }

    async tearDown(){
        Error = originalError;
        Error.prepareStackTrace = originalPrepareStackTrace;
       await super.tearDown();
    }
}

module.exports = JestCustomEnvironment;