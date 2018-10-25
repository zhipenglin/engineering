const customizeConfig = require('@engr/ic-customize-config'),
    fs = require('fs-extra'),
    path = require('path'),
    chalk = require('chalk');

module.exports = async () => {
    const {isCustomize, all, freezeList, activeList, formatUpdateList} = customizeConfig();

    const currentPath = fs.realpathSync(process.cwd()), buildDir = path.resolve(currentPath, 'build');
    if (!isCustomize) {
        console.log(chalk.yellow('该项目非定制类型项目，不需要缓存'));
        return;
    }

    if (!process.env.CACHE_DIR) {
        throw new Error('缓存目录不存在，请检查环境变量CACHE_DIR是否已经配置');
    }

    const cacheBaseDir = path.resolve(process.env.CACHE_DIR),
        cacheBuildDir = path.resolve(cacheBaseDir, 'active'),
        cacheFreezeDir = path.resolve(cacheBaseDir, 'freeze');

    await Promise.all([cacheBuildDir, cacheFreezeDir].map((dir) => fs.ensureDir(dir)));

    const list = formatUpdateList(await fs.readdir(buildDir) || []);

    if (list.length === 0) {
        console.log(chalk.yellow('build目录没有合法内容'));
    } else {
        console.log(chalk.green('将当前生成的结果复制到缓存'));
    }
    let newCacheList = [];
    await Promise.all(list.map(async (dirname) => {
        const targetDir = path.resolve(buildDir, dirname),
            targetCacheDir = path.resolve(cacheBuildDir, dirname,);
        const stats = await fs.stat(targetDir);
        if (stats && stats.isDirectory()) {
            newCacheList.push(dirname);
            await fs.emptyDir(targetCacheDir);
            await fs.copy(targetDir, targetCacheDir);
        }
    }));

    const cacheBuildList = await fs.readdir(cacheBuildDir);
    console.log(chalk.green('将活动缓存应用到当前目录'));
    let freezeCacheList = [], cleanCacheList = [];
    await Promise.all(cacheBuildList.map((name) => {
        if (activeList.indexOf(name) > -1) {
            return fs.copy(path.resolve(cacheBuildDir, name), path.resolve(buildDir, name));
        } else if (freezeList.indexOf(name) > -1) {
            console.log(chalk.blue(`将缓存中${name}冻结`));
            freezeCacheList.push(name);
            return fs.copy(path.resolve(cacheBuildDir, name), path.resolve(cacheFreezeDir, name)).then(() => {
                return fs.remove(path.resolve(cacheBuildDir, name));
            });
        } else {
            console.log(chalk.yellow(`缓存${name}已失效，执行清除`));
            cleanCacheList.push(name);
            return fs.remove(path.resolve(cacheBuildDir, name));
        }
    }));
    console.log(chalk.green('将冻结缓存应用到当前目录'));
    const cacheFreezeList = await fs.readdir(cacheFreezeDir);
    await Promise.all(cacheFreezeList.map((name) => {
        if (freezeList.indexOf(name) > -1) {
            return fs.copy(path.resolve(cacheFreezeDir, name), path.resolve(buildDir, name));
        } else {
            console.log(chalk.yellow(`缓存${name}已失效，执行清除`));
            cleanCacheList.push(name);
            return fs.remove(path.resolve(cacheFreezeDir, name));
        }
    }));

    //检查完整性
    await Promise.all(all.map(async (name) => {
        if (await fs.exists(path.resolve(buildDir, name)) === false) {
            if (activeList.indexOf(name) > -1) {
                throw new Error(`当前build目录缺少${name}，可能是由于本次打包列表未包含该项目，请重新配置updateList后重新执行打包`);
            } else if (freezeList.indexOf(name) > -1) {
                throw new Error(`当前build目录缺少${name}，该项目已经被冻结，可能由于缓存丢失，或者异常的缓存清理，请将该项目释放后重新执行打包`);
            } else {
                throw new Error(`当前build目录缺少${name}，可能是由于程序内部问题导致`);
            }
        }
    }));
    console.log(chalk.green('任务完成!'), newCacheList.length === 0 ? chalk.yellow('\n直接应用缓存，无缓存更新') : chalk.green(`\n${newCacheList.join(',')}执行了缓存更新`), freezeCacheList.length === 0 ? '' : chalk.blue(`\n${freezeCacheList.join(',')}执行了缓存冻结`), cleanCacheList.length === 0 ? '' : chalk.yellow(`\n${cleanCacheList.join(',')}执行了缓存清理`));
};
