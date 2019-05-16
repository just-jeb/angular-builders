module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: 'js-to-styles-var-loader',
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'js-to-styles-var-loader',
          },
        ],
      },
    ],
  },
};
