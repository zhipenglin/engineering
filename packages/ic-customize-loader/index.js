/**
 * @name: ic-customize-loader ;
 * @author: admin ;
 * @description: 处理定制的postcss插件和webpack loader ;
 * */

const path = require('path'),
    loaderUtils = require('loader-utils'),
    getResolvePath = require('./lib/getResolvePath'),
    transform = require('./lib/transform'),
    transformFeature = require('./lib/transformFeature'),
    getAst = require('./lib/getAst'),
    babel = require('@babel/core');

module.exports = function (content) {
    this.cacheable && this.cacheable();
    const basePath = path.dirname(this.resourcePath),
        options = Object.assign({
            feature: {
                open: false
            },
            rules: []
        }, loaderUtils.getOptions(this)),
        myResolver = this.resolve,
        ast = getAst(content);
    return getResolvePath(myResolver, ast, basePath, options.rules, options.feature.open).then((resolvePath) => {
        transform(resolvePath, ast, options.rules);
        if(options.feature.open){
            return transformFeature(myResolver, ast, basePath);
        }
    }).then(() => {
        return babel.transformFromAst(ast).code;
    });
};
