/**
 * @name: ic-scripts-rewired-aliases ;
 * @author: admin ;
 * @description: Add Webpack aliases to your project without ejecting ;
 * */

function createRewiredAliases(aliasesOptions = {}) {
    return function (config) {
        config.resolve.alias = {...config.resolve.alias, ...aliasesOptions};
        return config;
    };
}

module.exports = createRewiredAliases;
