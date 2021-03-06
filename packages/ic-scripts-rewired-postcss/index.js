/**
 * @name: ic-scripts-rewired-postcss ;
 * @author: admin ;
 * @description: Configure postcss in Create React App without ejecting ;
 * */

const { getLoader, loaderNameMatches } = require("@engr/ic-scripts-util");

function createRewiredPostcss(callback = (options)=>options) {
    return function (config) {
        getLoader(config.module.rules, rule => {
            if(loaderNameMatches(rule, "postcss-loader")){
                rule.options=callback(rule.options);
            }
        });
        return config;
    };
}

module.exports = createRewiredPostcss;
