/**
 * @name: ic-scripts-rewired-sass ;
 * @author: admin ;
 * @description: Configure SASS in Create React App without ejecting ;
 * */

const { getLoader, loaderNameMatches } = require("@engr/ic-scripts-util");

const sassExtension = /\.s(c|a)ss$/;

function createRewiredSass(sassLoaderOptions = {}) {
    return function(config, env) {
        const oneOfRule = config.module.rules.find(
            rule => rule.oneOf !== undefined,
        );

        const fileLoader = getLoader(config.module.rules, rule => {
            return loaderNameMatches(rule, "file-loader") && rule.exclude;
        });

        fileLoader.exclude.push(sassExtension);

        const createRule = (rule, cssRules) => {
            const parse=(loader)=>{
                const newLoader=loader.slice(0);
                newLoader.push({
                    loader:require.resolve("sass-loader"),
                    options: sassLoaderOptions
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
        const sassRules = createRule(
            {
                test: sassExtension
            },
            getLoader(
                config.module.rules,
                rule => String(rule.test) === String(/\.css$/),
            ),
        );

        if (oneOfRule) {
            oneOfRule.oneOf.unshift(sassRules);
        } else {
            config.module.rules.push(sassRules);
        }



        return config;
    };
}

const rewiredSass = createRewiredSass();

rewiredSass.withLoaderOptions = createRewiredSass;

module.exports = rewiredSass;
