const fs = require('fs-extra'),
    validateNpm = require('validate-npm-package-name'),
    parsePackageName = require('../lib/parsePackageName'),
    downloadModuleFromNpm = require('../lib/downloadModuleFromNpm'),
    globPromise = require('../lib/globPromise'),
    path = require('path'),
    _ = require('lodash'),
    inquirer = require('inquirer'),
    chalk = require('chalk');

_.templateSettings.interpolate = /{%=([\s\S]+?)%}/g;
_.templateSettings.evaluate = /{%([\s\S]+?)%}/g;

const ls = async () => {
    const packagesListPath = path.resolve(__dirname, '../.modules/');
    if (await fs.pathExists(packagesListPath)) {
        const list = await fs.readdir(packagesListPath);
        if (list.length > 0) {
            console.log();
            console.log(chalk.green(list.map((name) => `- ${name.replace('%2f', '/')}`).join('\n')));
            console.log();
            return;
        }

    }
    console.log(chalk.yellow('The module list is empty'));
}, rm = async () => {
    const packagesListPath = path.resolve(__dirname, '../.modules/');
    if (await fs.pathExists(packagesListPath)) {
        const list = await fs.readdir(packagesListPath);
        if (list.length === 0) {
            return console.log(chalk.red('The module list is empty'));
        }
        const moduleName = await inquirer.prompt([{
            type: 'list',
            name: 'module',
            message: 'Please select module',
            choices: [
                ...list.map((str) => {
                    const outStr = str.replace('%2f', '/');
                    return {
                        name: outStr,
                        value: str
                    }
                }), {
                    name: 'cancel',
                    value: ''
                }
            ]
        }]).then(({module}) => module);

        if (!moduleName) {
            return;
        }

        console.log(`removing module ${chalk.cyan(moduleName.replace('%2f', '/'))} ...`);
        await fs.remove(path.join(packagesListPath, moduleName));
        console.log(chalk.green('delete successful'));
        await ls();
    } else {
        console.log(chalk.red('The module list is empty'));
    }
}, add = async () => {
    const packagesListPath = path.resolve(__dirname, '../.modules/');
    const moduleName = await inquirer.prompt([{
        type: 'input',
        name: 'module',
        validate: (str) => validateNpm(parsePackageName(str).name).validForNewPackages ? true : 'Must be a legal package name'
    }]).then(({module}) => module);
    try {
        const packagePath = await downloadModuleFromNpm(moduleName);
        console.log(chalk.green(`add ${chalk.cyan(path.relative(packagesListPath, packagePath).replace('%2f', '/'))} success!`));
        await ls();
    } catch (e) {
        console.log(chalk.red(e.message));
    }
}, use = async () => {
    const currentPath = fs.realpathSync(process.cwd()),
        targetPath = path.resolve(currentPath, './src/modules');
    if (!await fs.pathExists(path.resolve(currentPath, './src'))) {
        return console.log(chalk.red(`The current project is not a canonical project, and the command can only be applied to projects created by the ${chalk.cyan('[run-create init]')} or projects that conform to its specifications.`));
    }

    const packagesListPath = path.resolve(__dirname, '../.modules/');
    let list = [];
    if (await fs.pathExists(packagesListPath)) {
        list = await fs.readdir(packagesListPath);
    }
    if (list.length === 0) {
        await add();
        list = await fs.readdir(packagesListPath);
    }
    const moduleName = await inquirer.prompt([{
        type: 'list',
        name: 'module',
        message: 'Please select module',
        choices: [
            ...list.map((str) => {
                const outStr = str.replace('%2f', '/');
                return {
                    name: outStr,
                    value: str
                }
            }), {
                name: 'cancel',
                value: ''
            }
        ]
    }]).then(({module}) => module);

    if (!moduleName) {
        return;
    }

    const {name} = parsePackageName(moduleName),
        modulePath = path.resolve(packagesListPath, `${moduleName}/module`),
        inquirerFilePath = path.resolve(packagesListPath, `${moduleName}/inquirer.js`);

    let customInquirer = [];
    if (await fs.pathExists(inquirerFilePath)) {
        customInquirer = require(inquirerFilePath);
    }

    const {targetModuleName, ...props} = await inquirer.prompt([
        {
            type: 'input',
            name: 'targetModuleName',
            default: _.last(name.split('%2f'))
        },
        ...customInquirer
    ]);

    const targetModulePath = path.resolve(targetPath, targetModuleName);

    if (await fs.pathExists(targetModulePath) && (await fs.readdir(targetModulePath)).length > 0) {
        return console.error(chalk.red(`The path${chalk.cyan('[' + path.relative(currentPath, targetModulePath) + ']')} has been occupied.`));
    }

    const files = await globPromise(path.join(modulePath, '/**/*'), {nodir: true, dot: true});
    await Promise.all(files.map(async (item) => {
        const filename = path.basename(item),
            filePath = path.resolve(targetModulePath, path.relative(modulePath, item));
        await fs.ensureDir(path.dirname(filePath));
        if (/^\.(html|htm|json|conf|md|sh|js|jsx|css|scss|sass|less|yml)$/.test(path.extname(item))) {
            try {
                const compile = _.template(await fs.readFile(item, 'utf8'));
                await fs.writeFile(filePath, compile({...props}));
            } catch (e) {
                console.error(e);
                throw new Error('module compilation failed. Check that the template syntax is correct');
            }
        } else {
            await fs.copy(item, filePath);
        }
    }));
};

module.exports = async (option) => {
    const mapping = {
        use, ls, rm, add
    };
    mapping[option]();
};
