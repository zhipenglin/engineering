/**
 * @name: ic-customize-loader ;
 * @author: admin ;
 * @description: 处理定制的postcss插件和webpack loader ;
 * */

const babylon = require('babylon'),
    path = require('path'),
    loaderUtils = require('loader-utils'),
    getResolvePath = require('./lib/getResolvePath'),
    transform = require('./lib/transform'),
    getAst=require('./lib/getAst');

module.exports = function (content) {
    this.cacheable && this.cacheable();
    const basePath = path.dirname(this.resourcePath),
        options = Object.assign({
            rules: []
        }, loaderUtils.getOptions(this)),
        myResolver = this.resolve,
        ast = getAst(content);
    return getResolvePath(myResolver, ast, basePath, options.rules).then((resolvePath) => {
        return transform(resolvePath, ast, options.rules);
    });
};
