/** @type {import('@composaic/core/dist/types/plugin-system/config-types').PluginManifestConfig} */
module.exports = {
  plugins: [
    {
      type: 'local',
      source: 'src/plugins/navbar/index.ts',
    },
    {
      type: 'local',
      source: 'src/plugins/views/index.ts',
    },
  ],
  optimization: {
    cacheDir: '.manifest-cache',
    watchMode: {
      patterns: ['src/**/*.ts'],
      debounceMs: 100,
    },
  },
};
