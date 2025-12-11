"use strict";
// To parse this data:
//
//   import { Convert, Schema } from "./file";
//
//   const schema = Convert.toSchema(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Convert = void 0;
// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
class Convert {
    static toSchema(json) {
        return cast(JSON.parse(json), u(a("any"), true, 3.14, 0, null, r("SchemaObject"), ""));
    }
    static schemaToJson(value) {
        return JSON.stringify(uncast(value, u(a("any"), true, 3.14, 0, null, r("SchemaObject"), "")), null, 2);
    }
}
exports.Convert = Convert;
function invalidValue(typ, val, key = '') {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
}
function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}
function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}
function transform(val, typ, getProps, key = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val)
            return val;
        return invalidValue(typ, val, key);
    }
    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            }
            catch (_) { }
        }
        return invalidValue(typs, val);
    }
    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1)
            return val;
        return invalidValue(cases, val);
    }
    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }
    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }
    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }
    if (typ === "any")
        return val;
    if (typ === null) {
        if (val === null)
            return val;
        return invalidValue(typ, val);
    }
    if (typ === false)
        return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ))
        return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number")
        return transformDate(val);
    return transformPrimitive(typ, val);
}
function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}
function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}
function a(typ) {
    return { arrayItems: typ };
}
function u(...typs) {
    return { unionMembers: typs };
}
function o(props, additional) {
    return { props, additional };
}
function m(additional) {
    return { props: [], additional };
}
function r(name) {
    return { ref: name };
}
const typeMap = {
    "SchemaObject": o([
        { json: "all", js: "all", typ: u(undefined, "any") },
        { json: "automock", js: "automock", typ: u(undefined, true) },
        { json: "bail", js: "bail", typ: u(undefined, true) },
        { json: "browser", js: "browser", typ: u(undefined, true) },
        { json: "cache", js: "cache", typ: u(undefined, true) },
        { json: "cacheDirectory", js: "cacheDirectory", typ: u(undefined, "") },
        { json: "changedFilesWithAncestor", js: "changedFilesWithAncestor", typ: u(undefined, true) },
        { json: "changedSince", js: "changedSince", typ: u(undefined, "") },
        { json: "ci", js: "ci", typ: u(undefined, true) },
        { json: "clearCache", js: "clearCache", typ: u(undefined, true) },
        { json: "clearMocks", js: "clearMocks", typ: u(undefined, true) },
        { json: "collectCoverage", js: "collectCoverage", typ: u(undefined, true) },
        { json: "collectCoverageFrom", js: "collectCoverageFrom", typ: u(undefined, a("")) },
        { json: "color", js: "color", typ: u(undefined, true) },
        { json: "colors", js: "colors", typ: u(undefined, true) },
        { json: "config", js: "config", typ: u(undefined, "") },
        { json: "configPath", js: "configPath", typ: u(undefined, "") },
        { json: "coverage", js: "coverage", typ: u(undefined, true) },
        { json: "coverageDirectory", js: "coverageDirectory", typ: u(undefined, "") },
        { json: "coveragePathIgnorePatterns", js: "coveragePathIgnorePatterns", typ: u(undefined, a("")) },
        { json: "coverageReporters", js: "coverageReporters", typ: u(undefined, a("")) },
        { json: "coverageThreshold", js: "coverageThreshold", typ: u(undefined, "") },
        { json: "debug", js: "debug", typ: u(undefined, true) },
        { json: "detectLeaks", js: "detectLeaks", typ: u(undefined, true) },
        { json: "detectOpenHandles", js: "detectOpenHandles", typ: u(undefined, true) },
        { json: "env", js: "env", typ: u(undefined, "") },
        { json: "errorOnDeprecated", js: "errorOnDeprecated", typ: u(undefined, true) },
        { json: "expand", js: "expand", typ: u(undefined, true) },
        { json: "filter", js: "filter", typ: u(undefined, "") },
        { json: "findRelatedTests", js: "findRelatedTests", typ: u(undefined, a("")) },
        { json: "forceExit", js: "forceExit", typ: u(undefined, true) },
        { json: "globalMocks", js: "globalMocks", typ: u(undefined, a("")) },
        { json: "globals", js: "globals", typ: u(undefined, "") },
        { json: "globalSetup", js: "globalSetup", typ: u(undefined, "") },
        { json: "globalTeardown", js: "globalTeardown", typ: u(undefined, "") },
        { json: "haste", js: "haste", typ: u(undefined, "") },
        { json: "init", js: "init", typ: u(undefined, true) },
        { json: "json", js: "json", typ: u(undefined, true) },
        { json: "lastCommit", js: "lastCommit", typ: u(undefined, true) },
        { json: "listTests", js: "listTests", typ: u(undefined, true) },
        { json: "logHeapUsage", js: "logHeapUsage", typ: u(undefined, true) },
        { json: "mapCoverage", js: "mapCoverage", typ: u(undefined, true) },
        { json: "maxWorkers", js: "maxWorkers", typ: u(undefined, u(0, "")) },
        { json: "moduleDirectories", js: "moduleDirectories", typ: u(undefined, a("")) },
        { json: "moduleFileExtensions", js: "moduleFileExtensions", typ: u(undefined, a("")) },
        { json: "moduleNameMapper", js: "moduleNameMapper", typ: u(undefined, "") },
        { json: "modulePathIgnorePatterns", js: "modulePathIgnorePatterns", typ: u(undefined, a("")) },
        { json: "modulePaths", js: "modulePaths", typ: u(undefined, a("")) },
        { json: "noStackTrace", js: "noStackTrace", typ: u(undefined, true) },
        { json: "notify", js: "notify", typ: u(undefined, true) },
        { json: "notifyMode", js: "notifyMode", typ: u(undefined, "") },
        { json: "onlyChanged", js: "onlyChanged", typ: u(undefined, true) },
        { json: "onlyFailures", js: "onlyFailures", typ: u(undefined, true) },
        { json: "outputFile", js: "outputFile", typ: u(undefined, "") },
        { json: "passWithNoTests", js: "passWithNoTests", typ: u(undefined, true) },
        { json: "preset", js: "preset", typ: u(undefined, "") },
        { json: "prettierPath", js: "prettierPath", typ: u(undefined, "") },
        { json: "projects", js: "projects", typ: u(undefined, a("")) },
        { json: "reporters", js: "reporters", typ: u(undefined, a("")) },
        { json: "resetMocks", js: "resetMocks", typ: u(undefined, true) },
        { json: "resetModules", js: "resetModules", typ: u(undefined, true) },
        { json: "resolver", js: "resolver", typ: u(undefined, "") },
        { json: "restoreMocks", js: "restoreMocks", typ: u(undefined, true) },
        { json: "rootDir", js: "rootDir", typ: u(undefined, "") },
        { json: "roots", js: "roots", typ: u(undefined, a("")) },
        { json: "runInBand", js: "runInBand", typ: u(undefined, true) },
        { json: "runner", js: "runner", typ: u(undefined, "") },
        { json: "runTestsByPath", js: "runTestsByPath", typ: u(undefined, true) },
        { json: "setupFiles", js: "setupFiles", typ: u(undefined, a("")) },
        { json: "setupFilesAfterEnv", js: "setupFilesAfterEnv", typ: u(undefined, "") },
        { json: "shard", js: "shard", typ: u(undefined, "") },
        { json: "showConfig", js: "showConfig", typ: u(undefined, true) },
        { json: "silent", js: "silent", typ: u(undefined, true) },
        { json: "skipFilter", js: "skipFilter", typ: u(undefined, true) },
        { json: "snapshotSerializers", js: "snapshotSerializers", typ: u(undefined, a("")) },
        { json: "testEnvironment", js: "testEnvironment", typ: u(undefined, "") },
        { json: "testEnvironmentOptions", js: "testEnvironmentOptions", typ: u(undefined, "") },
        { json: "testFailureExitCode", js: "testFailureExitCode", typ: u(undefined, "") },
        { json: "testLocationInResults", js: "testLocationInResults", typ: u(undefined, true) },
        { json: "testMatch", js: "testMatch", typ: u(undefined, a("")) },
        { json: "testNamePattern", js: "testNamePattern", typ: u(undefined, "") },
        { json: "testPathIgnorePatterns", js: "testPathIgnorePatterns", typ: u(undefined, a("")) },
        { json: "testPathPattern", js: "testPathPattern", typ: u(undefined, a("")) },
        { json: "testRegex", js: "testRegex", typ: u(undefined, a("")) },
        { json: "testResultsProcessor", js: "testResultsProcessor", typ: u(undefined, "") },
        { json: "testRunner", js: "testRunner", typ: u(undefined, "") },
        { json: "testURL", js: "testURL", typ: u(undefined, "") },
        { json: "timers", js: "timers", typ: u(undefined, "") },
        { json: "transform", js: "transform", typ: u(undefined, "") },
        { json: "transformIgnorePatterns", js: "transformIgnorePatterns", typ: u(undefined, a("")) },
        { json: "tsConfig", js: "tsConfig", typ: u(undefined, "") },
        { json: "unmockedModulePathPatterns", js: "unmockedModulePathPatterns", typ: u(undefined, a("")) },
        { json: "updateSnapshot", js: "updateSnapshot", typ: u(undefined, true) },
        { json: "useStderr", js: "useStderr", typ: u(undefined, true) },
        { json: "verbose", js: "verbose", typ: u(undefined, true) },
        { json: "version", js: "version", typ: u(undefined, true) },
        { json: "watch", js: "watch", typ: u(undefined, true) },
        { json: "watchAll", js: "watchAll", typ: u(undefined, true) },
        { json: "watchman", js: "watchman", typ: u(undefined, true) },
        { json: "watchPathIgnorePatterns", js: "watchPathIgnorePatterns", typ: u(undefined, a("")) },
    ], a("")),
};
//# sourceMappingURL=schema.js.map