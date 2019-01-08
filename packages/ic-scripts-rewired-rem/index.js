/**
 * @name: ic-scripts-rewired-rem ;
 * @author: admin ;
 * @description: 移动端px转rem ;
 * */
const {getLoader, loaderNameMatches} = require("@engr/ic-scripts-util");

function createRewiredRem(remOptions = {}) {
    return function (config, env) {
        const parse = (loader, cssLoader) => {
            const cssLoaderIndex = loader.indexOf(cssLoader) || 1;
            const newLoader = loader.slice(0);
            newLoader.splice(cssLoaderIndex + 1, 0, {
                loader: require.resolve('./lib/px2rem-loader'),
                options: remOptions
            });
            return newLoader;
        };
        getLoader(config.module.rules, (rule, parentRule) => {
            if (loaderNameMatches(rule, "css-loader")) {
                if (env === "production") {
                    parentRule.loader = parse(parentRule.loader, rule);
                } else {
                    parentRule.use = parse(parentRule.use, rule);
                }

            }
        });
        return config;
    }
}

const rewiredRem = createRewiredRem();

rewiredRem.withLoaderOptions = createRewiredRem;
module.exports = rewiredRem;
