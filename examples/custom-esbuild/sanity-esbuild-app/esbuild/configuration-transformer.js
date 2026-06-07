/**
 * Index HTML transformer for issues #1690 / #1710 test.
 * Signature: (indexHtml: string, target: Target) => string
 * Injects a <meta> tag with the configuration name so we can verify it in the output file.
 */
module.exports = function configurationTransformer(indexHtml, target) {
  const configuration = target.configuration ?? 'default';
  const metaTag = `<meta name="build-configuration" content="${configuration}">`;
  return indexHtml.replace('</head>', `  ${metaTag}\n</head>`);
};
