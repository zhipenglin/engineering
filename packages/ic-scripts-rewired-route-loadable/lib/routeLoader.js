const path = require('path'),
    template = require('lodash/template'),
    fs = require('fs'),
    loaderUtils = require('loader-utils');

const client = fs.readFileSync(path.resolve(__dirname, './client.tpl'), 'utf-8'),
    routerClient = template(client),
    server = fs.readFileSync(path.resolve(__dirname, './server.tpl'), 'utf-8'),
    routerServer = template(server);

module.exports = function (content) {
    this.cacheable && this.cacheable();
    const routeConfig = JSON.parse(content);

    const options = Object.assign({
        isServer: false
    }, loaderUtils.getOptions(this));

    if (options.isServer) {
        return routerServer({data: routeConfig});
    } else {
        return routerClient({data: routeConfig});
    }
};