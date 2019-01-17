const {getLoader, getBabelLoader, loaderNameMatches} = require("@engr/ic-scripts-util"),
    cloneDeep = require('lodash/cloneDeep'),
    {paths} = require('@engr/ic-scripts-util'),
    get = require('lodash/get'), path = require('path');

module.exports = (target, config) => {
    let index=0;
    getLoader(config.module.rules, (rule, parentRule) => {
        if (loaderNameMatches(rule, "babel-loader")) {
            let currentRule = rule;
            if (!rule.test) {
                currentRule = parentRule;
            }
            target.module.rules[0].oneOf.splice(index++, 0, cloneDeep(currentRule));
        }
    });

    target.resolve = cloneDeep(config.resolve);
    target.output.path = path.resolve(config.output.path || paths.appBuild, 'server');
    target.output.publicPath = path.join(config.output.publicPath, 'server');
    return target;
};
