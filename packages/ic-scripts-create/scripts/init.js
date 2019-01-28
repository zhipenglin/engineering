const inquirer = require('inquirer'),
    validateNpm = require('validate-npm-package-name'),
    spawn = require('cross-spawn'),
    chalk = require('chalk'),
    path = require('path'),
    leftPad = require('left-pad'),
    globPromise = require('../lib/globPromise'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    getTemplatePath = require('../lib/getTemplatePath'),
    parsePackageName = require('../lib/parsePackageName');

_.templateSettings.interpolate = /{%=([\s\S]+?)%}/g;
_.templateSettings.evaluate = /{%([\s\S]+?)%}/g;

const getTemplate = (customList) => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'template',
            message: 'Please select template',
            choices: [
                new inquirer.Separator('====Built-in template===='),
                {
                    name: 'simple (Same as create-react-app)',
                    value: 'simple'
                }, {
                    name: 'with egg (A complete development kit with egg,on the basis of template simple)',
                    value: 'with-egg'
                }, {
                    name: 'with customize (Added customized support,on the basis of template with-egg)',
                    value: 'with-customize'
                },
                new inquirer.Separator('====External template===='),
                ...customList.map((str) => {
                    str = str.replace('%2f', '/');
                    return {
                        name: str,
                        value: `custom-${str}`
                    }
                }),
                {
                    name: 'user defined',
                    value: ''
                }
            ]
        }
    ]).then(({template}) => {
        if (template.indexOf('custom-') === 0) {
            return {
                template: template.replace('custom-', ''),
                isNpm: true
            }
        }
        if (!template) {
            return inquirer.prompt([{
                type: 'input',
                name: 'template',
                validate: (str) => validateNpm(parsePackageName(str).name).validForNewPackages ? true : 'Must be a legal package name'
            }]).then(({template}) => ({template, isNpm: true}));
        }
        return {template}
    });
};
const getInfo = (projectName) => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            default: projectName,
            validate: (str) => validateNpm(str).validForNewPackages ? true : 'Must be a legal package name'
        }, {
            type: 'input',
            name: 'alias',
            default: projectName
        }, {
            type: 'input',
            name: 'public_path',
            default: ''
        }, {
            type: 'input',
            name: 'port',
            validate: (str) => {
                str = Number(str);
                return Number.isInteger(str) && str >= 7000 && str <= 10000 ? true : 'please enter an integer between 7000-10000'
            }
        }
    ]);
};

module.exports = async (projectName) => {
    const currentPath = fs.realpathSync(process.cwd()),
        targetPath = path.resolve(currentPath, projectName),
        date = new Date(),
        time = `${date.getFullYear()}年${leftPad(date.getMonth() + 1, 2, '0')}月${leftPad(date.getDate(), 2, '0')}日 ${leftPad(date.getHours(), 2, '0')}:${leftPad(date.getMinutes(), 2, '0')}`;
    const validFiles = [
        '.DS_Store',
        'Thumbs.db',
        '.git',
        '.gitignore',
        '.idea',
        'README.md',
        'LICENSE',
        '.hg',
        '.hgignore',
        '.hgcheck',
        '.npmignore',
        'mkdocs.yml',
        'docs',
        '.travis.yml',
        '.gitlab-ci.yml',
        '.gitattributes',
    ];
    if (await fs.exists(targetPath)) {
        const conflicts = fs
            .readdirSync(targetPath)
            .filter(file => !validFiles.includes(file))
            // IntelliJ IDEA creates module files before CRA is launched
            .filter(file => !/\.iml$/.test(file))

        if (conflicts.length > 0) {
            console.log(
                `The directory ${chalk.green(projectName)} contains files that could conflict:`
            );
            console.log();
            for (const file of conflicts) {
                console.log(`  ${file}`);
            }
            console.log();
            console.log(
                'Either try using a new directory name, or remove the files listed above.'
            );

            return;
        }
    }
    const {name, alias, port, public_path} = await getInfo(projectName);

    const packagesListPath = path.resolve(__dirname, '../.packages/');
    let customPackageList = [];
    if (await fs.pathExists(packagesListPath)) {
        customPackageList = await fs.readdir(packagesListPath);
    }
    const {template, isNpm} = await getTemplate(customPackageList);
    const tplPath = await getTemplatePath(template, isNpm);
    console.log(`Creating a new React app in ${chalk.green(targetPath)}`);
    const files = await globPromise(path.join(tplPath, '/**/*'), {nodir: true, dot: true});
    await Promise.all(files.map(async (item) => {
        let templateItemPath = item;
        if (/^dot-/.test(path.basename(item))) {
            templateItemPath = path.join(path.dirname(item), path.basename(item).replace('dot-', '.'));
        }
        const filename = path.basename(templateItemPath),
            filePath = path.resolve(targetPath, path.relative(tplPath, templateItemPath));
        if (validFiles.indexOf(filename) > -1 && await fs.exists(filename)) {
            return;
        }
        await fs.ensureDir(path.dirname(filePath));
        if (/^\.(html|htm|json|conf|md|sh|js|jsx|css|scss|sass|less|yml)$/.test(path.extname(templateItemPath)) || /^\.env/.test(filename) || filename === 'Dockerfile') {
            try {
                const compile = _.template(await fs.readFile(item, 'utf8'));
                const removeEncode=(str='')=>str.replace(/\{\\%/g,'{%').replace(/%\\}/g,'%}');

                await fs.writeFile(filePath, removeEncode(compile({name, public_path, alias, port, template, date, time})));
            } catch (e) {
                console.error(e);
                throw new Error('template compilation failed. Check that the template syntax is correct');
            }
        } else {
            await fs.copy(item, filePath);
        }
    }));

    console.log('Installing packages. This might take a couple of minutes.');

    await new Promise((resolve, reject) => {
        const child = spawn('npm', ['install', '--loglevel', 'error'], {
            stdio: 'inherit',
            cwd: targetPath
        });
        child.on('close', (code) => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });

    console.log(`Success! Created ${name} at ${chalk.green(targetPath)}\n`, 'Inside that directory, you can run several commands:\n');
    console.log();
    console.log(chalk.cyan('  npm start\n'), '    Starts the development server.');
    console.log();
    console.log(chalk.cyan('  npm test\n'), '    Starts the test runner.');
    console.log();
    console.log(chalk.cyan('  npm run build\n'), '    Bundles the app into static files for production,but this operation is best executed automatically on CI.');
    console.log();
    console.log('We suggest that you begin by typing:\n', chalk.cyan('cd'), ` ${projectName}\n`, chalk.cyan('npm start'));
    console.log();
    console.log('Happy hacking!');
};
