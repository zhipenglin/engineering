/**
 * @name: ic-scripts-rewired-customize ;
 * @author: admin ;
 * @description: Add Webpack customize-loader to your project without ejecting ;
 * */

const {getBabelLoader, loaderNameMatches, getLoader, paths} = require("@engr/ic-scripts-util"),
    {getFeatures} = require('@engr/ic-customize-config')(),
    customizePlugin = require('@engr/ic-customize-loader/postcssPlugin');

const createRewiredCustomize = (customizeLoaderOptions) => {
    customizeLoaderOptions = Object.assign({}, {
        test: /@p@([./])/g,
        postcssOptions: {},
        featureOptions: {}
    }, customizeLoaderOptions);

    return (config, env) => {
        const babelLoader = getBabelLoader(config.module.rules), oldBabelLoader = Object.assign({}, babelLoader);
        delete babelLoader['loader'];
        delete babelLoader['options'];
        let customizeTarget = process.env.CUSTOMIZE_TARGET;
        const features = getFeatures(customizeTarget),
            featuresString = features.map((name) => `${name}$1`).join(' ');
        if (customizeTarget === 'common') {
            customizeTarget = '';
        }

        const rules = [
            {
                test: customizeLoaderOptions.test,
                value: `${customizeTarget ? customizeTarget + '$1' : ''}${featuresString ? ' ' + featuresString : ''}`
            }
        ];

        babelLoader.use = [
            {
                loader: require.resolve('@engr/ic-customize-loader'),
                options: {
                    feature: customizeLoaderOptions.featureOptions,
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

        const postcssPlugins = postcssLoader.options.plugins();

        postcssPlugins.splice(0, 0, customizePlugin({
            rules
        }));

        postcssLoader.options.plugins = () => postcssPlugins;
        Object.assign(postcssLoader.options, customizeLoaderOptions.postcssOptions);

        if (customizeLoaderOptions.featureOptions.open) {
            config.resolve.modules.push(paths.appFeature);
            const oneOfRule = config.module.rules.find(
                rule => rule.oneOf !== undefined,
            );
            if (oneOfRule) {
                const jsLoader = getLoader(
                    oneOfRule.oneOf,
                    rule => String(rule.test) === String(/\.(js|mjs|jsx)$/)
                );
                if (!Array.isArray(jsLoader.include)) {
                    jsLoader.include = [jsLoader.include];
                }
                jsLoader.include.push(paths.appFeature);
            }
        }

        return config;
    };
};

const rewiredCustomize = createRewiredCustomize();

rewiredCustomize.withLoaderOptions = createRewiredCustomize;

module.exports = rewiredCustomize;
