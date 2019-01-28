const path = require('path'),
    fs = require('fs-extra'),
    hyperquest = require('hyperquest'),
    getTarball = require('./getTarball'),
    parsePackageName = require('./parsePackageName'),
    extractStream = require('./extractStream');

module.exports = async (template) => {
    const {name: packageName, version: packageVersion} = parsePackageName(template);
    const {tarball, latest, registry} = await getTarball({name: packageName, version: packageVersion}),
        packagesPath = path.resolve(__dirname, `../.modules/${packageName.replace(/\//g, '%2f')}@${latest}`),
        modulesPath = path.resolve(packagesPath, './module');
    if (!await fs.pathExists(modulesPath)) {
        if (!tarball) {
            throw new Error(`package ${packageName}@${latest} do not exist in the registry ${registry}`);
        }

        const stream = hyperquest(tarball);

        await fs.emptyDir(packagesPath);
        await extractStream(stream, packagesPath);
        if (!await fs.pathExists(modulesPath)) {
            await fs.remove(packagesPath);
            throw new Error(`module  does not exist in the package ${packageName}@${latest}`);
        }
    }
    return packagesPath;
};
