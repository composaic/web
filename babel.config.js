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
                        browsers: '>0.2%, not dead, not op_mini all'
                    }
                }
            ],
            '@babel/preset-typescript',
            '@babel/preset-react'
        ],
        plugins: [
            '@babel/plugin-transform-runtime',
            // Add this custom plugin
            {
                visitor: {
                    ImportDeclaration(path) {
                        const source = path.node.source;
                        if (source.value.endsWith('.scss')) {
                            source.value = source.value.replace(/\.scss$/, '.css');
                        }
                    }
                }
            }
        ]
    };
};