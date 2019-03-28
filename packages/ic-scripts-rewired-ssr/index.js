/**
 * @name: ic-scripts-rewired-ssr ;
 * @author: admin ;
 * @description: 添加服务器端渲染支持 ;
 * */
const mergeConfig = require('./mergeConfig'),
    fs = require('fs'),
    chalk = require('chalk'),
    {paths, getBabelLoader} = require('@engr/ic-scripts-util'),
    rewiredRoute = require('@engr/ic-scripts-rewired-route-loadable'),
    LoadablePlugin = require('@loadable/webpack-plugin'),
    WritePlugin = require('write-file-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin');

const createRewiredSSR = () => {
    return (config, env) => {
        if (fs.existsSync(paths.appServerIndexJs)) {
            const outputConfig = [config];
            const babelLoader = getBabelLoader(config.module.rules);
            babelLoader.options.plugins.push(require.resolve('@loadable/babel-plugin'));
            config.plugins.push(new LoadablePlugin());

            const htmlWebpackPlugin = config.plugins.find((item) => item.constructor.name === 'HtmlWebpackPlugin');
            htmlWebpackPlugin && (htmlWebpackPlugin.options.inject = false);

            const webpackConfig = require('./config/webpack.config');
            let serverConfig = mergeConfig(webpackConfig, config, env);

            config = rewiredRoute()(config, env);
            serverConfig = rewiredRoute({isServer: true})(serverConfig, env);
            if (env === 'development') {
                serverConfig.plugins.push(new WritePlugin());
                serverConfig.plugins.push(new CleanWebpackPlugin());
            }
            outputConfig.push(serverConfig);
            return outputConfig;
        } else {
            config = rewiredRoute()(config, env);
            console.log(chalk.red(`SSR cannot be turned on now,make sure the file ${paths.appServerIndexJs} exists.`));
        }
        return config;
    };
};

const rewiredSSR = createRewiredSSR();

rewiredSSR.withOptions = createRewiredSSR;

module.exports = rewiredSSR;
