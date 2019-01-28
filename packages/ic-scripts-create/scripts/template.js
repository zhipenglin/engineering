const fs = require('fs-extra'),
    validateNpm = require('validate-npm-package-name'),
    parsePackageName = require('../lib/parsePackageName'),
    downloadTemplateFromNpm = require('../lib/downloadTemplateFromNpm'),
    path = require('path'),
    inquirer = require('inquirer'),
    chalk = require('chalk');

const ls = async () => {
    const packagesListPath = path.resolve(__dirname, '../.packages/');
    if (await fs.pathExists(packagesListPath)) {
        const list = await fs.readdir(packagesListPath);
        if (list.length > 0) {
            console.log();
            console.log(chalk.green(list.map((name) => `- ${name.replace('%2f', '/')}`).join('\n')));
            console.log();
            return;
        }

    }
    console.log(chalk.yellow('The template list is empty'));
}, rm = async () => {
    const packagesListPath = path.resolve(__dirname, '../.packages/');
    if (await fs.pathExists(packagesListPath)) {
        const list = await fs.readdir(packagesListPath);
        if(list.length===0){
            return console.log(chalk.red('The template list is empty'));
        }
        const templateName = await inquirer.prompt([{
            type: 'list',
            name: 'template',
            message: 'Please select template',
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
        }]).then(({template}) => template);

        if (!templateName) {
            return;
        }

        console.log(`removing template ${chalk.cyan(templateName.replace('%2f', '/'))} ...`);
        await fs.remove(path.join(packagesListPath, templateName));
        console.log(chalk.green('delete successful'));
        await ls();
    } else {
        console.log(chalk.red('The template list is empty'));
    }
}, add = async () => {
    const packagesListPath = path.resolve(__dirname, '../.packages/');
    const templateName = await inquirer.prompt([{
        type: 'input',
        name: 'template',
        validate: (str) => validateNpm(parsePackageName(str).name).validForNewPackages ? true : 'Must be a legal package name'
    }]).then(({template}) => template);
    try {
        const packagePath = await downloadTemplateFromNpm(templateName);
        console.log(chalk.green(`add ${chalk.cyan(path.relative(packagesListPath, packagePath).replace('%2f', '/'))} success!`));
        await ls();
    } catch (e) {
        console.log(chalk.red(e.message));
    }
};

module.exports = async (option) => {
    const mapping = {
        ls, rm, add
    };
    mapping[option]();
};
