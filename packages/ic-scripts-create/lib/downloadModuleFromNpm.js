const path = require('path'),
    fs = require('fs-extra'),
    hyperquest = require('hyperquest'),
    getTarball = require('./getTarball'),
    parsePackageName = require('./parsePackageName'),
    extractStream = require('./extractStream');

module.exports = async (template) => {
    const {name: packageName, version: packageVersion} = parsePackageName(template);
    const tarball = await getTarball({name: packageName, version: packageVersion}),
        packagesPath = path.resolve(__dirname, `../.packages/${packageName.replace(/\//g, '%2f')}@${latest}`),
        templatePath = path.resolve(packagesPath, './template');
    if (!await fs.pathExists(templatePath)) {
        if (!tarball) {
            throw new Error(`package ${packageName}@${latest} do not exist in the registry ${registry}`);
        }

        const stream = hyperquest(tarball);

        await fs.emptyDir(packagesPath);
        await extractStream(stream, packagesPath);
        if (!await fs.pathExists(templatePath)) {
            await fs.remove(packagesPath);
            throw new Error(`template  does not exist in the package ${packageName}@${latest}`);
        }
    }
    return packagesPath;
};
