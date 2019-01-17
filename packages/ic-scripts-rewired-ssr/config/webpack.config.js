const nodeExternals = require('webpack-node-externals'),
    {paths} = require('@engr/ic-scripts-util'),
    webpack = require('webpack'),
    LoadablePlugin = require('@loadable/webpack-plugin');

module.exports = {
    target: 'node',
    devtool: 'false',
    mode: 'production',
    externals: [nodeExternals()],
    entry: paths.appServerIndexJs,
    output: {
        filename: '[name].[chunkhash:8].js',
        chunkFilename: '[name].[chunkhash:8].chunk.js',
        library: 'app',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [{
            oneOf: [
                {
                    test: /\.(scss|sass|css|less)$/,
                    loader: 'css-loader/locals'
                },
                {
                    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                    loader: 'url-loader',
                    options: {
                        emitFile: false
                    },
                },
                {
                    exclude: [/\.(js|mjs|jsx)$/, /\.html$/, /\.json$/],
                    loader: 'file-loader',
                    options: {
                        emitFile: false
                    }
                }
            ]
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            window: 'window-or-global'
        }),
        new LoadablePlugin()
    ]
};
