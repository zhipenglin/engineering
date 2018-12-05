const loaderUtils = require('loader-utils'),
    Px2rem = require('./px2rem');

module.exports = function (source) {
    const options = loaderUtils.getOptions(this),
        px2remIns = new Px2rem(options)
    return px2remIns.generateRem(source)
}
