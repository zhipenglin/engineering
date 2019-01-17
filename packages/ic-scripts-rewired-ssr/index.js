/**
 * @name: ic-scripts-rewired-ssr ;
 * @author: admin ;
 * @description: 添加服务器端渲染支持 ;
 * */
const mergeConfig = require('./mergeConfig'),
    fs = require('fs'),
    chalk = require('chalk'),
    {paths, getBabelLoader} = require('@engr/ic-scripts-util'),
    LoadablePlugin = require('@loadable/webpack-plugin'),WritePlugin=require('write-file-webpack-plugin')

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
            const serverConfig = mergeConfig(webpackConfig, config, env);
            if(env==='development'){
                serverConfig.plugins.push(new WritePlugin());
            }
            outputConfig.push(serverConfig);
            return outputConfig;
        } else {
            console.log(chalk.red(`SSR cannot be turned on now,make sure the file ${paths.appServerIndexJs} exists.`));
        }
        return config;
    };
};

const rewiredSSR = createRewiredSSR();

rewiredSSR.withOptions = createRewiredSSR;

module.exports = rewiredSSR;
