/**
 * @name: ic-scripts-rewired-less ;
 * @author: admin ;
 * @description: Configure LESS in Create React App without ejecting ;
 * */

const { getLoader, loaderNameMatches } = require("@engr/ic-scripts-util");

const lessExtension = /\.less$/;

function createRewiredLess(lessLoaderOptions = {}) {
    return function(config, env) {
        const oneOfRule = config.module.rules.find(
            rule => rule.oneOf !== undefined,
        );

        const fileLoader = getLoader(config.module.rules, rule => {
            return loaderNameMatches(rule, "file-loader") && rule.exclude;
        });

        fileLoader.exclude.push(lessExtension);

        const createRule = (rule, cssRules) => {
            const parse=(loader)=>{
                const newLoader=loader.slice(0);
                newLoader.push({
                    loader:require.resolve("less-loader"),
                    options: lessLoaderOptions
                });

                return newLoader;
            };
            if (env === "production") {
                return {
                    ...rule,
                    loader: parse(cssRules.loader),
                };
            } else {
                return {
                    ...rule,
                    use: parse(cssRules.use),
                };
            }
        };
        const lessRules = createRule(
            {
                test: lessExtension
            },
            getLoader(
                config.module.rules,
                rule => String(rule.test) === String(/\.css$/),
            ),
        );

        if (oneOfRule) {
            oneOfRule.oneOf.unshift(lessRules);
        } else {
            config.module.rules.push(lessRules);
        }



        return config;
    };
}

const rewiredLess = createRewiredLess();

rewiredLess.withLoaderOptions = createRewiredLess;

module.exports = rewiredLess;
