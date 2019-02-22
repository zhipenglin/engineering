const fs = require('fs-extra'),
    spawn = require('cross-spawn'),
    semver = require('semver'),
    validateNpm = require('validate-npm-package-name'),
    parsePackageName = require('../lib/parsePackageName'),
    downloadModuleFromNpm = require('../lib/downloadModuleFromNpm'),
    globPromise = require('../lib/globPromise'),
    path = require('path'),
    _ = require('lodash'),
    inquirer = require('inquirer'),
    loadJson = require('load-json-file'),
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
        inquirerFilePath = path.resolve(packagesListPath, `${moduleName}/inquirer.js`),
        packagePath = path.resolve(packagesListPath, `${moduleName}/package.json`);

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
        if (/^\.(html|htm|json|conf|md|sh|js|jsx|css|scss|sass|less|yml|wxml|wxss)$/.test(path.extname(item))) {
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
    //检查依赖，自动安装
    const {dependencies} = await loadJson(packagePath),
        nameList = dependencies && Object.keys(dependencies);

    if (nameList && nameList.length > 0) {
        //检查包兼容性
        console.log('Check module dependency compatibility.');
        await Promise.all(nameList.map(async (name) => {
            const modulePackagePath = path.resolve(currentPath, 'node_modules', name, 'package.json');
            if (await fs.exists(modulePackagePath)) {
                const {version} = await loadJson(modulePackagePath);
                nameList.splice(nameList.indexOf(name), 1);
                if (!semver.satisfies(version, dependencies[name])) {
                    console.log(chalk.yellow(`Module ${name}${chalk.cyan(`[current:${name}@${version},module need ${name}@${dependencies[name]}]`)} dependencies are incompatible with the current project installation version,Please install it manually by yourself.`));
                }
            }
        }));
        if (nameList.length > 0) {
            console.log('Installation module dependency package. This might take a couple of minutes.');
            await new Promise((resolve, reject) => {
                const child = spawn('npm', ['install', '--save-dev', nameList.map((name) => `${name}@${dependencies[name]}`).join(' '), '--loglevel', 'error'], {
                    stdio: 'inherit',
                    cwd: currentPath
                });
                child.on('close', (code) => {
                    if (code !== 0) {
                        reject({
                            command: `npm install error`,
                        });
                        return;
                    }
                    resolve();
                });
            });
        }
    }
    console.log(`Success! Applied ${targetModuleName} at ${chalk.green(targetPath)}`);
};

module.exports = async (option) => {
    const mapping = {
        use, ls, rm, add
    };
    mapping[option]();
};
