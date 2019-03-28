/**
 * @name: ic-scripts-rewired-route-loadable ;
 * @author: admin ;
 * @description: 服务器端渲染架构将route配置转换为loadable ;
 * */

const {getBabelLoader} = require('@engr/ic-scripts-util'), path = require('path');

module.exports = function (options) {
    options = Object.assign({
        isServer: false
    }, options);
    return (config, env) => {
        const babelLoader = getBabelLoader(config.module.rules);

        const oneOfRule = config.module.rules.find(
            rule => rule.oneOf !== undefined,
        );
        const rule = {
            test: /\.route$/,
            use: [
                {
                    loader: babelLoader.loader,
                    options: babelLoader.options
                },
                {
                    loader: require.resolve('./lib/routeLoader'),
                    options
                }
            ]
        };

        if (oneOfRule) {
            oneOfRule.oneOf.unshift(rule);
        } else {
            config.module.rules.push(rule);
        }

        config.resolve.extensions.push('.route');

        return config;
    };
};