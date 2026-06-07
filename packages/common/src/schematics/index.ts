export * from './rules';
export * from './detection';
export * from './version';
export * from './migrate-jiti-loader';
// testing.ts is exported via the ./schematics/testing subpath, not the barrel,
// so production schematics never pull SchematicTestRunner into their bundle.
