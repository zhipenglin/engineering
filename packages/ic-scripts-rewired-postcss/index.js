/**
 * @name: ic-scripts-rewired-postcss ;
 * @author: admin ;
 * @description: Configure postcss in Create React App without ejecting ;
 * */

const { getLoader, loaderNameMatches } = require("@engr/ic-scripts-util");

function createRewiredPostcss(callback = (options)=>options) {
    return function (config) {
        const postcssLoader=getLoader(config.module.rules, rule => {
            return loaderNameMatches(rule, "postcss-loader");
        });
        postcssLoader.options=callback(postcssLoader.options);
        return config;
    };
}

module.exports = createRewiredPostcss;
