const nodeExternals = require('webpack-node-externals'),
    {paths}=require('@engr/ic-scripts-util');

module.exports = {
    target: 'node',
    devtool:'false',
    mode:'production',
    externals: [nodeExternals()],
    entry: paths.appServerIndexJs,
    output: {
        publicPath: '/',
        filename: 'static/js/server.js',
        library: 'app',
        libraryTarget: 'commonjs2'
    }
};
