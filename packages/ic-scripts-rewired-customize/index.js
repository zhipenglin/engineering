/**
 * @name: ic-scripts-rewired-customize ;
 * @author: admin ;
 * @description: Add Webpack customize-loader to your project without ejecting ;
 * */

const {getBabelLoader, loaderNameMatches, getLoader} = require("@engr/ic-scripts-util"), {getFeatures} = require('@engr/ic-customize-config'),customizePlugin=require('@engr/ic-customize-loader/postcssPlugin');

const createRewiredCustomize = (customizeLoaderOptions = {test: /@p@([./])/g,postcssOptions:{}}) => {
    return (config, env) => {
        const babelLoader = getBabelLoader(config.module.rules), oldBabelLoader = Object.assign({}, babelLoader);
        delete babelLoader['loader'];
        delete babelLoader['options'];
        let customizeTarget = process.env.DEV_TARGET;
        const features = getFeatures(customizeTarget),
            featuresString = features.map((name) => `${name}$1`).join(' ');
        if (customizeTarget === 'common') {
            customizeTarget = '';
        }

        const rules=[
            {
                test: customizeLoaderOptions.test,
                value: `${customizeTarget?customizeTarget+'$1':''}${featuresString ? ' ' + featuresString : ''}`
            }
        ];

        babelLoader.use = [
            {
                loader: require.resolve('@engr/ic-customize-loader'),
                options: {
                    rules
                }
            },
            {
                loader: oldBabelLoader.loader,
                options: oldBabelLoader.options
            }
        ];

        const postcssLoader = getLoader(config.module.rules, rule => {
            return loaderNameMatches(rule, "postcss-loader");
        });

        const postcssPlugins=postcssLoader.options.plugins();

        postcssPlugins.splice(0,0,customizePlugin({
            rules
        }));

        postcssLoader.options.plugins=()=>postcssPlugins;
        Object.assign(postcssLoader.options,customizeLoaderOptions.postcssOptions);
        return config;
    };
};

const rewiredCustomize = createRewiredCustomize();

rewiredCustomize.withLoaderOptions = createRewiredCustomize;

module.exports = rewiredCustomize;
