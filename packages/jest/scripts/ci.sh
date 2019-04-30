#!/usr/bin/env bash
set -eE;
trap 'echo ERROR: $BASH_SOURCE:$LINENO $BASH_COMMAND >&2;' ERR

function validateSingleTestRun() {
    testCommand=$1;
    testCommandArgsString=$2;
    suits=$3;
    suitsTotal=$4;
    tests=$5;
    testsTotal=$6;
    testsSkipped=$7;
    additionalStep=$8;
    ngTestParams=$9;#TODO: remove once this is merged https://github.com/facebook/jest/pull/7549

    IFS=',' read -ra testCommandArgs <<< "$testCommandArgsString";
    set -x;
    ${testCommand} "${ngTestParams}" "${testCommandArgs[@]}" 2>&1 | tee tests.log;
    set +x;
    if [[ ! -z ${additionalStep} ]]; then
        ${additionalStep}
    fi
    testPrefix="Tests:       ";
    if [[ ! -z ${testsSkipped} ]]; then
        echo inside: $7
        testPrefix="${testPrefix}${testsSkipped} skipped, "
    fi
    set -x;
    grep -q "Test Suites: ${suits} passed, ${suitsTotal} total" ./tests.log;
    grep -q "${testPrefix}${tests} passed, ${testsTotal} total" ./tests.log;
    set +x;
}

function validateAllTestRuns() {
    local -n allTests=$1;
    ngTestParams=$2;
    for testOpt in "${allTests[@]}"; do
        IFS='|' read -ra testParams <<< "$testOpt";
        validateSingleTestRun "${testParams[@]}" "${ngTestParams}";
    done
}


function ciApp() {
    appDir=$1;
    e2eOptions=$2;
    local -n testOptions=$3;
    ngTestParams=$4;
    packagePath=$(realpath --relative-to="$appDir" "$(pwd)/${filename}");
    (
        cd ${appDir};
        validateAllTestRuns testOptions ${ngTestParams}
        set -x;
        yarn e2e ${e2eOptions};
        set +x
    )
}

function checkJunit() {
    if [[ -f ./junit.xml ]]; then
        rm -f ./junit.xml
    else
        echo "ERROR: junit.xml was not created"
        exit 1
    fi
}

simpleAppTestOptions=(
    "yarn test||1|1|3|3|||"
    "yarn test|--testNamePattern=^AppComponent should create the app$|1|1|1|3|2||"
    "yarn test|--reporters=default,--reporters=jest-junit|1|1|3|3||checkJunit"
)

multiAppTestOptions=(
    "yarn test my-first-app||1|1|3|3|||"
    "yarn test my-second-app||1|1|3|3|||"
    "yarn test my-shared-library||2|2|2|2|||"
    "yarn test my-first-app|--testNamePattern=^AppComponent should create the app$|1|1|1|3|2||"
    "yarn test my-shared-library|--testPathPattern=src/lib/my-shared-library.service.spec.ts$|1|1|1|1|||"
    "yarn test my-shared-library|--testPathPattern=src/lib/my-shared-library.component.spec.ts$,--testPathPattern=src/lib/my-shared-library.service.spec.ts$|2|2|2|2|||"
    "yarn test my-shared-library|--rootDir=`pwd`/examples/multiple-apps/projects/my-shared-library|2|2|2|2|||--configPath=../../../../scripts/symlinks-custom-root-jest.config.js"
)
(ciApp ./examples/simple-app --protractor-config=./e2e/protractor-ci.conf.js simpleAppTestOptions --configPath=../../scripts/symlinks-jest.config.js)
(ciApp ./examples/multiple-apps --configuration=ci multiAppTestOptions --configPath=../../../../scripts/symlinks-jest.config.js)

