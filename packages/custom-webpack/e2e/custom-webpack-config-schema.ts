export const customWebpackConfig = {
  description: 'Custom webpack configuration',
  default: false,
  oneOf: [
    {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the custom webpack configuration file',
        },
        mergeRules: {
          type: 'object',
          description:
            'Merge rules as described here: https://github.com/survivejs/webpack-merge#mergewithrules',
        },
        replaceDuplicatePlugins: {
          type: 'boolean',
          description: 'Flag that indicates whether to replace duplicate webpack plugins or not',
        },
        verbose: {
          type: 'object',
          description: 'Determines whether to log configuration properties into a console',
          properties: {
            properties: {
              description:
                "A list of properties to log into a console, for instance, `['plugins', 'mode', 'entry']`",
              type: 'array',
              items: {
                type: 'string',
              },
            },
            serializationDepth: {
              type: 'number',
              description: 'The number of times to recurse the object while formatting',
            },
          },
        },
      },
    },
    {
      type: 'boolean',
    },
  ],
};

export const indexTransform = {
  type: 'string',
  description: 'Path to the file with index.html transform function',
};
