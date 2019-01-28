const getNpmRegistry = require('./getNpmRegistry'),
    semver = require('semver'),
    _ = require('lodash'),
    getStream = require('get-stream'),
    hyperquest = require('hyperquest');

module.exports = async ({name, version}) => {
    const registry = await getNpmRegistry(),
        res = await getStream(hyperquest(`${registry}${name.replace(/\//g, '%2f')}`)),
        packageInfo = JSON.parse(res),
        latest = version && semver.valid(version) || _.get(packageInfo, 'dist-tags.latest'),
        tarball = _.get(packageInfo, `versions["${latest}"].dist.tarball`);
    return {tarball, registry, latest};
};
