const path = require('path'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    hyperquest = require('hyperquest'),
    unpack = require('tar-pack').unpack,
    getStream = require('get-stream'),
    semver = require('semver'),
    getNpmRegistry = require('./getNpmRegistry'),
    parsePackageName = require('./parsePackageName');

const extractStream = (stream, dest) => {
    return new Promise((resolve, reject) => {
        stream.pipe(
            unpack(dest, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dest);
                }
            })
        );
    });
}

module.exports=async (template)=>{
    const {name: packageName, version: packageVersion} = parsePackageName(template);
    const registry = await getNpmRegistry(),
        res = await getStream(hyperquest(`${registry}${packageName.replace(/\//g, '%2f')}`)),
        packageInfo = JSON.parse(res),
        latest = packageVersion && semver.valid(packageVersion) || _.get(packageInfo, 'dist-tags.latest'),
        tarball = _.get(packageInfo, `versions["${latest}"].dist.tarball`),
        packagesPath = path.resolve(__dirname, `../.packages/${packageName.replace(/\//g, '%2f')}@${latest}`),
        templatePath=path.resolve(packagesPath,'./template');
    if (!await fs.pathExists(templatePath)) {
        if (!tarball) {
            throw new Error(`package ${packageName}@${latest} do not exist in the registry ${registry}`);
        }

        const stream = hyperquest(tarball);

        await fs.emptyDir(packagesPath);
        await extractStream(stream, packagesPath);
        if(!await fs.pathExists(templatePath)){
            await fs.remove(packagesPath);
            throw new Error(`template  does not exist in the package ${packageName}@${latest}`);
        }
    }
    return packagesPath;
};
