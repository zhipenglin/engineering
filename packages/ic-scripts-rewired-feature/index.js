/**
 * @name: ic-scripts-rewired-feature ;
 * @author: admin ;
 * @description: 特性包支持 ;
 * */
const path = require('path'),
    fs = require('fs'),
    {getLoader} = require("@engr/ic-scripts-util");

module.exports = function (config, env) {
    const featureModulesDir = path.join(fs.realpathSync(process.cwd()), 'feature_modules');
    config.resolve.modules.push(featureModulesDir);
    const oneOfRule = config.module.rules.find(
        rule => rule.oneOf !== undefined,
    );
    if (oneOfRule) {
        const jsLoader = getLoader(
            oneOfRule.oneOf,
            rule => String(rule.test) === String(/\.(js|jsx|mjs)$/)
        );
        if (!Array.isArray(jsLoader.include)) {
            jsLoader.include = [jsLoader.include];
        }
        jsLoader.include.push(featureModulesDir);
    }
    return config;
};
