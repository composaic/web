const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');

module.exports = merge(common, {
  output: {
    filename: 'index.js',
    libraryTarget: 'module',
  },
  experiments: {
    outputModule: true,
  },
  mode: 'production',
});
