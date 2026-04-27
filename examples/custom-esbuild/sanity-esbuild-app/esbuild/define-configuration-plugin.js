/**
 * Factory plugin (Pattern 1: string path in angular.json).
 * Receives (builderOptions, target) from the builder.
 * Injects `target.configuration` as a global define constant `buildConfiguration`.
 *
 * This is the test for issues #1710 and #1690:
 * verifying that target.configuration is accessible inside a factory plugin.
 */
function defineConfigurationPlugin(builderOptions, target) {
  const configuration = target.configuration ?? 'default';
  return {
    name: 'define-configuration',
    setup(build) {
      const options = build.initialOptions;
      options.define = options.define || {};
      options.define.buildConfiguration = JSON.stringify(configuration);
    },
  };
}

module.exports = defineConfigurationPlugin;
