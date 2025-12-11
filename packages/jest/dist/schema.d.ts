export interface SchemaObject {
    /**
     * The opposite of `onlyChanged`. If `onlyChanged` is set by default, running jest with
     * `--all` will force Jest to run all tests instead of running only tests related to changed
     * files.
     */
    all?: any;
    /**
     * Automock all files by default.
     */
    automock?: boolean;
    /**
     * Exit the test suite immediately upon the first failing test.
     */
    bail?: boolean;
    /**
     * Respect the "browser" field in package.json when resolving modules. Some packages export
     * different versions based on whether they are operating in node.js or a browser.
     */
    browser?: boolean;
    /**
     * Whether to use the transform cache. Disable the cache using --no-cache.
     */
    cache?: boolean;
    /**
     * The directory where Jest should store its cached  dependency information.
     */
    cacheDirectory?: string;
    /**
     * Runs tests related to the current changes and the changes made in the last commit.
     * Behaves similarly to `--onlyChanged`.
     */
    changedFilesWithAncestor?: boolean;
    /**
     * Runs tests related the changes since the provided branch. If the current branch has
     * diverged from the given branch, then only changes made locally will be tested. Behaves
     * similarly to `--onlyChanged`.
     */
    changedSince?: string;
    /**
     * Whether to run Jest in continuous integration (CI) mode.
     */
    ci?: boolean;
    /**
     * Clears the configured Jest cache directory and then exits. Default directory can be found
     * by calling jest --showConfig
     */
    clearCache?: boolean;
    /**
     * Automatically clear mock calls and instances between every test. Equivalent to calling
     * jest.clearAllMocks() between each test.
     */
    clearMocks?: boolean;
    /**
     * Alias for --coverage.
     */
    collectCoverage?: boolean;
    /**
     * An array of glob patterns indicating a set of files for which coverage information should
     * be collected. If a file matches the specified glob pattern, coverage information will be
     * collected for it even if no tests exist for this file and it's never required in the test
     * suite
     */
    collectCoverageFrom?: string[];
    /**
     * Forces test results output color highlighting (even if stdout is not a TTY). Set to false
     * if you would like to have no colors.
     */
    color?: boolean;
    /**
     * Alias for `--color`.
     */
    colors?: boolean;
    /**
     * The path to a jest config file specifying how to find and execute tests. If no rootDir is
     * set in the config, the directory containing the config file is assumed to be the rootDir
     * for the project.This can also be a JSON encoded value which Jest will use as
     * configuration.
     */
    config?: string;
    /**
     * Path to jest config file.
     */
    configPath?: string;
    /**
     * Indicates that test coverage information should be collected and reported in the output.
     */
    coverage?: boolean;
    /**
     * The directory where Jest should output its coverage files.
     */
    coverageDirectory?: string;
    /**
     * An array of regexp pattern strings that are matched against all file paths before
     * executing the test. If the file pathmatches any of the patterns, coverage information
     * will be skipped.
     */
    coveragePathIgnorePatterns?: string[];
    /**
     * A list of reporter names that Jest uses when writing coverage reports. Any istanbul
     * reporter can be used.
     */
    coverageReporters?: string[];
    /**
     * A JSON string with which will be used to configure minimum threshold enforcement for
     * coverage results
     */
    coverageThreshold?: string;
    /**
     * Print debugging info about your jest config.
     */
    debug?: boolean;
    /**
     * **EXPERIMENTAL**: Detect memory leaks in tests. After executing a test, it will try to
     * garbage collect the global object used, and fail if it was leaked
     */
    detectLeaks?: boolean;
    /**
     * Print out remaining open handles preventing Jest from exiting at the end of a test run.
     */
    detectOpenHandles?: boolean;
    /**
     * The test environment used for all tests. This can point to any file or node module.
     * Examples: `jsdom`, `node` or `path/to/my-environment.js`
     */
    env?: string;
    /**
     * Make calling deprecated APIs throw helpful error messages.
     */
    errorOnDeprecated?: boolean;
    /**
     * Use this flag to show full diffs instead of a patch.
     */
    expand?: boolean;
    /**
     * Path to a module exporting a filtering function. This method receives a list of tests
     * which can be manipulated to exclude tests from running. Especially useful when used in
     * conjunction with a testing infrastructure to filter known broken tests.
     */
    filter?: string;
    /**
     * Find related tests for a list of source files that were passed in as arguments. Useful
     * for pre-commit hook integration to run the minimal amount of tests necessary.
     */
    findRelatedTests?: string[];
    /**
     * Force Jest to exit after all tests have completed running. This is useful when resources
     * set up by test code cannot be adequately cleaned up.
     */
    forceExit?: boolean;
    /**
     * Enabled global mocks
     */
    globalMocks?: string[];
    /**
     * A JSON string with map of global variables that need to be available in all test
     * environments.
     */
    globals?: string;
    /**
     * The path to a module that runs before All Tests.
     */
    globalSetup?: string;
    /**
     * The path to a module that runs after All Tests.
     */
    globalTeardown?: string;
    /**
     * A JSON string with map of variables for the haste module system
     */
    haste?: string;
    /**
     * Generate a basic configuration file
     */
    init?: boolean;
    /**
     * Prints the test results in JSON. This mode will send all other test output and user
     * messages to stderr.
     */
    json?: boolean;
    /**
     * Run all tests affected by file changes in the last commit made. Behaves similarly to
     * `--onlyChanged`.
     */
    lastCommit?: boolean;
    /**
     * Lists all tests Jest will run given the arguments and exits. Most useful in a CI system
     * together with `--findRelatedTests` to determine the tests Jest will run based on specific
     * files
     */
    listTests?: boolean;
    /**
     * Logs the heap usage after every test. Useful to debug memory leaks. Use together with
     * `--runInBand` and `--expose-gc` in node.
     */
    logHeapUsage?: boolean;
    /**
     * Maps code coverage reports against original source code when transformers supply source
     * maps.
     *
     * DEPRECATED
     */
    mapCoverage?: boolean;
    /**
     * Specifies the maximum number of workers the worker-pool will spawn for running tests.
     * This defaults to the number of the cores available on your machine. (its usually best not
     * to override this default)
     */
    maxWorkers?: number | string;
    /**
     * An array of directory names to be searched recursively up from the requiring module's
     * location.
     */
    moduleDirectories?: string[];
    /**
     * An array of file extensions your modules use. If you require modules without specifying a
     * file extension, these are the extensions Jest will look for.
     */
    moduleFileExtensions?: string[];
    /**
     * A JSON string with a map from regular expressions to module names that allow to stub out
     * resources, like images or styles with a single module
     */
    moduleNameMapper?: string;
    /**
     * An array of regexp pattern strings that are matched against all module paths before those
     * paths are to be considered "visible" to the module loader.
     */
    modulePathIgnorePatterns?: string[];
    /**
     * An alternative API to setting the NODE_PATH env variable, modulePaths is an array of
     * absolute paths to additional locations to search when resolving modules.
     */
    modulePaths?: string[];
    /**
     * Disables stack trace in test results output
     */
    noStackTrace?: boolean;
    /**
     * Activates notifications for test results.
     */
    notify?: boolean;
    /**
     * Specifies when notifications will appear for test results.
     */
    notifyMode?: string;
    /**
     * Attempts to identify which tests to run based on which files have changed in the current
     * repository. Only works if you're running tests in a git or hg repository at the moment.
     */
    onlyChanged?: boolean;
    /**
     * Run tests that failed in the previous execution.
     */
    onlyFailures?: boolean;
    /**
     * Write test results to a file when the --json option is also specified.
     */
    outputFile?: string;
    /**
     * Will not fail if no tests are found (for example while using `--testPathPattern`.)
     */
    passWithNoTests?: boolean;
    /**
     * A preset that is used as a base for Jest's configuration.
     */
    preset?: string;
    /**
     * The path to the "prettier" module used for inline snapshots.
     */
    prettierPath?: string;
    /**
     * A list of projects that use Jest to run all tests of all projects in a single instance of
     * Jest.
     */
    projects?: string[];
    /**
     * A list of custom reporters for the test suite.
     */
    reporters?: string[];
    /**
     * Automatically reset mock state between every test. Equivalent to calling
     * jest.resetAllMocks() between each test.
     */
    resetMocks?: boolean;
    /**
     * If enabled, the module registry for every test file will be reset before running each
     * individual test.
     */
    resetModules?: boolean;
    /**
     * A JSON string which allows the use of a custom resolver.
     */
    resolver?: string;
    /**
     * Automatically restore mock state and implementation between every test. Equivalent to
     * calling jest.restoreAllMocks() between each test.
     */
    restoreMocks?: boolean;
    /**
     * The root directory that Jest should scan for tests and modules within.
     */
    rootDir?: string;
    /**
     * A list of paths to directories that Jest should use to search for files in.
     */
    roots?: string[];
    /**
     * Run all tests serially in the current process (rather than creating a worker pool of
     * child processes that run tests). This is sometimes useful for debugging, but such use
     * cases are pretty rare.
     */
    runInBand?: boolean;
    /**
     * Allows to use a custom runner instead of Jest's default test runner.
     */
    runner?: string;
    /**
     * Used when provided patterns are exact file paths. This avoids converting them into a
     * regular expression and matching it against every single file.
     */
    runTestsByPath?: boolean;
    /**
     * The paths to modules that run some code to configure or set up the testing environment
     * before each test.
     */
    setupFiles?: string[];
    /**
     * A list of paths to modules that run some code to configure or set up the testing
     * framework before each test.
     */
    setupFilesAfterEnv?: string;
    /**
     * The test suite shard to execute in a format of (?<shardIndex>\d+)/(?<shardCount>\d+).
     *
     * shardIndex describes which shard to select while shardCount controls the number of shards
     * the suite should be split into.
     *
     * shardIndex and shardCount have to be 1-based, positive numbers, and shardIndex has to be
     * lower than or equal to shardCount.
     *
     * When shard is specified the configured testSequencer has to implement a shard method.
     *
     * For example, to split the suite into three shards, each running one third of the tests:
     */
    shard?: string;
    /**
     * Print your jest config and then exits.
     */
    showConfig?: boolean;
    /**
     * Prevent tests from printing messages through the console.
     */
    silent?: boolean;
    /**
     * Disables the filter provided by --filter. Useful for CI jobs, or local enforcement when
     * fixing tests.
     */
    skipFilter?: boolean;
    /**
     * A list of paths to snapshot serializer modules Jest should use for snapshot testing.
     */
    snapshotSerializers?: string[];
    /**
     * Alias for --env
     */
    testEnvironment?: string;
    /**
     * Test environment options that will be passed to the testEnvironment. The relevant options
     * depend on the environment.
     */
    testEnvironmentOptions?: string;
    /**
     * Exit code of `jest` command if the test run failed
     */
    testFailureExitCode?: string;
    /**
     * Add `location` information to the test results
     */
    testLocationInResults?: boolean;
    /**
     * The glob patterns Jest uses to detect test files.
     */
    testMatch?: string[];
    /**
     * Run only tests with a name that matches the regex pattern.
     */
    testNamePattern?: string;
    /**
     * An array of regexp pattern strings that are matched against all test paths before
     * executing the test. If the test path matches any of the patterns, it will be skipped.
     */
    testPathIgnorePatterns?: string[];
    /**
     * A regexp pattern string that is matched against all tests paths before executing the test.
     */
    testPathPattern?: string[];
    /**
     * A string or array of string regexp patterns that Jest uses to detect test files.
     */
    testRegex?: string[];
    /**
     * Allows the use of a custom results processor. This processor must be a node module that
     * exports a function expecting as the first argument the result object.
     */
    testResultsProcessor?: string;
    /**
     * Allows to specify a custom test runner. The default is  `jasmine2`. A path to a custom
     * test runner can be provided: `<rootDir>/path/to/testRunner.js`.
     */
    testRunner?: string;
    /**
     * This option sets the URL for the jsdom environment.
     */
    testURL?: string;
    /**
     * Setting this value to fake allows the use of fake timers for functions such as setTimeout.
     */
    timers?: string;
    /**
     * A JSON string which maps from regular expressions to paths to transformers.
     */
    transform?: string;
    /**
     * An array of regexp pattern strings that are matched against all source file paths before
     * transformation.
     */
    transformIgnorePatterns?: string[];
    /**
     * The path to the TypeScript configuration file.
     */
    tsConfig?: string;
    /**
     * An array of regexp pattern strings that are matched against all modules before the module
     * loader will automatically return a mock for them.
     */
    unmockedModulePathPatterns?: string[];
    /**
     * Use this flag to re-record snapshots. Can be used together with a test suite pattern or
     * with `--testNamePattern` to re-record snapshot for test matching the pattern
     */
    updateSnapshot?: boolean;
    /**
     * Divert all output to stderr.
     */
    useStderr?: boolean;
    /**
     * Display individual test results with the test suite hierarchy.
     */
    verbose?: boolean;
    /**
     * Print the version and exit
     */
    version?: boolean;
    /**
     * Watch files for changes and rerun tests related to changed files. If you want to re-run
     * all tests when a file has changed, use the `--watchAll` option.
     */
    watch?: boolean;
    /**
     * Watch files for changes and rerun all tests. If you want to re-run only the tests related
     * to the changed files, use the `--watch` option.
     */
    watchAll?: boolean;
    /**
     * Whether to use watchman for file crawling. Disable using --no-watchman.
     */
    watchman?: boolean;
    /**
     * An array of regexp pattern strings that are matched against all paths before trigger test
     * re-run in watch mode. If the test path matches any of the patterns, it will be skipped.
     */
    watchPathIgnorePatterns?: string[];
}
export declare class Convert {
    static toSchema(json: string): any[] | boolean | number | number | null | SchemaObject | string;
    static schemaToJson(value: any[] | boolean | number | number | null | SchemaObject | string): string;
}
