/** @type {import('@composaic/core/dist/types/plugin-system/config-types').PluginManifestConfig} */
module.exports = {
    plugins: [
        {
            type: 'system',
            source: 'src/plugins/navbar/index.ts',
            output: 'src/plugins/navbar/navbar-plugin.json',
        },
        {
            type: 'system',
            source: 'src/plugins/views/index.ts',
            output: 'src/plugins/views/views-plugin.json',
        }
    ],
    optimization: {
        cacheDir: '.manifest-cache',
        watchMode: {
            patterns: ['src/**/*.ts'],
            debounceMs: 100,
        },
    },
};