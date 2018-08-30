#!/usr/bin/env node
/**
 * @name: ic-customize-cache ;
 * @author: admin ;
 * @description: 打包缓存 ;
 * */

const all = require('@engr/ic-customize-config').all,
    fs = require('fs-extra'),
    path = require('path'),
    chalk = require('chalk');
const run = async () => {
    const currentPath = fs.realpathSync(process.cwd()), buildDir = path.resolve(currentPath, 'build');
    if (all.length === 0) {
        console.log(chalk.yellow('该项目非定制类型项目，不需要缓存'));
        return;
    }

    if (!process.env.CACHE_DIR) {
        console.log(chalk.red('缓存目录不存在，请检查环境变量CACHE_DIR是否已经配置'));
        process.exit(1);
        return;
    }

    const cacheBuildDir = path.resolve(process.env.CACHE_DIR);

    const list = await fs.readdir(buildDir);

    console.log(chalk.green('将当前生成的结果复制到缓存'));
    let newCacheList = [];
    await Promise.all(list.map(async (dirname) => {
        const targetDir = path.resolve(buildDir, dirname),
            targetCacheDir = path.resolve(cacheBuildDir, dirname);
        const stats = await fs.stat(targetDir);
        if (stats.isDirectory() && all.indexOf(dirname) > -1) {
            newCacheList.push(dirname);
            await fs.emptyDir(targetCacheDir);
            await fs.copy(targetDir, targetCacheDir);
        }
    }));

    console.log(chalk.green('将现有缓存应用到当前目录'));
    await fs.copy(cacheBuildDir, buildDir);

    //检查完整性
    await Promise.all(all.map(async (dirname) => {
        if (await fs.exists(path.resolve(buildDir, dirname)) === false) {
            console.log(chalk.red(`当前build目录缺少${dirname}，请先执行全量打包`));
            process.exit(1);
        }
    }));
    console.log(chalk.green(`任务完成!\n${newCacheList.join(',')}执行了缓存更新`));
};

run();
