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
            if (env === "production") {
                return {
                    ...rule,
                    loader: [
                        ...cssRules.loader,
                        { loader: "sass-loader", options: sassLoaderOptions },
                    ],
                };
            } else {
                return {
                    ...rule,
                    use: [
                        ...cssRules.use,
                        { loader: "sass-loader", options: sassLoaderOptions },
                    ],
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
