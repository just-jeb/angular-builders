/**
 * Index HTML transformer for issues #1690 / #1710 / #2419 test.
 * Signature: (indexHtml: string, target: Target, options: CustomEsbuildApplicationSchema) => string
 * Injects <meta> tags with the configuration name and a resolved builder option
 * so we can verify both in the output file.
 */
module.exports = function configurationTransformer(indexHtml, target, options) {
  const configuration = target.configuration ?? 'default';
  const metaTags = [
    `<meta name="build-configuration" content="${configuration}">`,
    `<meta name="build-output-hashing" content="${options.outputHashing}">`,
  ];
  return indexHtml.replace('</head>', `  ${metaTags.join('\n  ')}\n</head>`);
};
