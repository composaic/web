const path = require('path');

module.exports = {
    entry: './src/index.ts',
    externals: {
        'react': 'react',
        'react-dom': 'react-dom',
        'react-router-dom': 'react-router-dom',
        '@mui/material': '@mui/material',
        '@mui/styled-engine': '@mui/styled-engine',
        '@emotion/react': '@emotion/react',
        '@emotion/styled': '@emotion/styled',
        '@composaic/core': '@composaic/core'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s?css$/,
                oneOf: [
                    {
                        test: /\.m\.s?css$/,
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: {
                                        localIdentName: '[name]__[local]__[hash:base64:5]',
                                        exportLocalsConvention: 'camelCase',
                                    },
                                    importLoaders: 1,
                                },
                            },
                            'sass-loader',
                        ],
                    },
                    {
                        use: [
                            'style-loader',
                            'css-loader',
                            'sass-loader',
                        ],
                    },
                ],
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.scss', '.css'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        clean: true,
    },
    mode: 'production',
    optimization: {
        minimize: true,
        sideEffects: true,
        usedExports: true
    }
};
