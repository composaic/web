module.exports = (api) => {
  const isESM = api.env('esm');

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isESM ? false : 'cjs',
          targets: {
            node: 'current',
            browsers: '>0.2%, not dead, not op_mini all',
          },
          debug: true,
        },
      ],
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
      '@babel/plugin-transform-runtime',
    ],
    sourceMaps: true,
    retainLines: true,
  };
};
