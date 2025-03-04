const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');

const developmentConfig = {
  mode: 'development',
  devtool: 'eval-source-map', // Better for development debugging
  output: {
    filename: 'index.js',
    libraryTarget: 'module',
  },
  experiments: {
    outputModule: true,
  },
};

const productionConfig = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    libraryTarget: 'module',
  },
  experiments: {
    outputModule: true,
  },
  optimization: {
    minimize: true,
    sideEffects: true,
    usedExports: true,
  },
};

module.exports = (env) => {
  if (env.development) {
    return merge(common, developmentConfig);
  }
  return merge(common, productionConfig);
};
