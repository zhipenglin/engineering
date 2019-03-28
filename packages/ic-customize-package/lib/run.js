const glob = require("glob"),
    path = require('path'),
    fs = require('fs-extra'),
    chalk = require('chalk'),
    loadJsonFile = require('load-json-file'),
    writeJsonFile = require('write-json-file'),
    {paths} = require('@engr/ic-scripts-util'),
    config = require('@engr/ic-customize-config')(),
    all = config.all.filter((name) => name !== 'common');
const globPromise = (...args) => {
    return new Promise((resolve, reject) => {
        glob(...args, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
};

const originalFileName = 'original.json';
const featureConfigName = 'featureConfig.json';

const pack = async (name) => {
    const filesArray = await globPromise(path.join(paths.appSrc, `/**/*?(.)${name}?(.*)`), {
        ignore: path.join(paths.appSrc, 'tob/**/*')
    }), featurePath = path.resolve(paths.appFeature, name);
    if (await fs.exists(featurePath)) {
        console.log(chalk.red('该特性包已存在，可能是由于该特性已经被抽出'));
        return;
    }

    let files = [];
    for (let index = 0; index < filesArray.length; index++) {
            const target = filesArray[index], stats = await fs.stat(target);
            if (stats && stats.isDirectory()) {
                files = files.concat(await globPromise(path.join(target, '/**/*'), {nodir: true}));
            } else {
                files.push(target);
            }
    }

    console.log(chalk.cyan(`共查找到${files.length}个特性文件`));
    console.log(chalk.green('执行特性文件抽出'));

    const mapList = [];
    await fs.ensureDir(featurePath);
    await Promise.all(files.map((src) => {
        const target = src.replace(new RegExp(`${name}([./])`, 'g'), ''),
            targetPath = path.resolve(featurePath, path.relative(paths.appSrc, target));
        mapList.push({
            target: path.relative(paths.appRoot, targetPath), original: path.relative(paths.appRoot, src)
        });
        return fs.copy(src, targetPath);
    }));
    console.log(chalk.green('执行特性文件映射'));
    await fs.writeJson(path.resolve(featurePath, originalFileName), mapList);
    console.log(chalk.green('执行特性配置的抽出'));
    const customizeConfig = await loadJsonFile(paths.customizeConfig), featureConfig = customizeConfig.features[name];
    if (featureConfig) {
        delete customizeConfig.features[name];
        await writeJsonFile(path.resolve(featurePath, featureConfigName), featureConfig);
    }

    console.log(chalk.green('执行源文件清理'));
    featureConfig && await writeJsonFile(paths.customizeConfig, customizeConfig);
    await Promise.all(mapList.map(({original}) => fs.remove(path.resolve(paths.appRoot, original))));
    console.log(chalk.green(`完成特性${name}的抽出`));
};

const unpack = async (name) => {
    const featurePath = path.resolve(paths.appFeature, name),
        list = await fs.readJson(path.resolve(featurePath, originalFileName));
    console.log(chalk.green(`检查特性包${name}完整性`));
    if (!(await Promise.all(list.map(({target}) => fs.exists(path.resolve(paths.appRoot, target))))).every((exists) => exists)) {
        console.log(chalk.red(`特性包${name}不完整，可能是由于被非法删除，请手动检查原因，修正问题后重试`));
        return;
    }
    console.log(chalk.green('将特性包释放到源文件夹中'));
    await Promise.all(list.map(({target, original}) => fs.copy(path.resolve(paths.appRoot, target), path.resolve(paths.appRoot, original))));
    const featureConfigPath = path.resolve(featurePath, featureConfigName);
    if (await fs.exists(featureConfigPath)) {
        const customizeConfig = await loadJsonFile(paths.customizeConfig),
            featureConfig = await loadJsonFile(featureConfigPath);
        customizeConfig["features"][name] = featureConfig;
        writeJsonFile(paths.customizeConfig, customizeConfig);
        console.log(chalk.green('恢复customize.json配置'));
    }

    console.log(chalk.green('删除特性包'));
    await fs.remove(featurePath);
    console.log(chalk.green(`完成特性包${name}释放`));
};

const analyze = async (scope) => {
    const INDENT_SPACE = '    ',
        INDENT_PIPE = ' │  ',
        INDENT_NODE = ' ├─ ',
        INDENT_NODE_LAST = ' └─ ';
    const list = [...all, ...config.features].indexOf(scope) > -1 ? [scope] : all;
    const featuresList = {};
    await Promise.all([...all, ...config.features].map(async (name) => {
        const featurePath = path.resolve(paths.appFeature, name);
        if (config.freezeList.indexOf(name) > -1) {
            const list = await fs.readJson(path.resolve(featurePath, originalFileName));
            featuresList[name] = list.map((item) => item.target);
        } else {
            featuresList[name] = await globPromise(path.join(paths.appSrc, `/**/*?(.)${name}?(.*)`), {
                ignore: path.join(paths.appSrc, 'tob/**/*')
            });
        }
    }));

    const getHeader = (list = []) => {
        let header = '', colors = [chalk.green, chalk.yellow, chalk.cyan];
        list.forEach((item, index) => {
            if (item === true) {
                header += colors[index](index === list.length - 1 ? INDENT_NODE_LAST : INDENT_SPACE);
            } else if (item === false) {
                header += colors[index](index === list.length - 1 ? INDENT_NODE : INDENT_PIPE);
            }
        });
        return header;
    };

    const outputFiles = async (name, isLast, itemIsLast, projectIsLast) => {
        console.log(getHeader([projectIsLast, itemIsLast, isLast]), chalk.cyan(name));
    };
    const outputFeatures = async (name, isLast, itemIsLast) => {
        console.log(getHeader([itemIsLast, isLast]), chalk.yellow(name));
        const fileList = featuresList[name];
        for (const name of fileList) {
            const index = fileList.indexOf(name);
            await outputFiles(name, index === fileList.length - 1, isLast, itemIsLast);
        }
    };
    const outputProject = async (name, isLast) => {
        console.log(getHeader([isLast]), chalk.green(name));
        const features = [name, ...config.getFeatures(name)];
        if (features) {
            for (const name of features) {
                const index = features.indexOf(name);
                await outputFeatures(name, index === features.length - 1, isLast);
            }
        }
    };
    for (const name of list) {
        const index = list.indexOf(name);
        config.all.indexOf(name) > -1 ? await outputProject(name, index === list.length - 1) : await outputFeatures(name, index === list.length - 1);
    }
};

const merge = async ({base,target,name}) => {
    //检查冲突

    //将target合并到base
    //修改base名称
};

module.exports = {pack, unpack, analyze, merge};
