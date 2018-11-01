const paths = require('../lib/paths'),
    runCommand = require('../lib/runCommand'),
    fs = require('fs-extra'),
    path = require('path'),
    chalk = require('chalk');

module.exports = async () => {
    try {
        if (!await fs.exists(paths.gitConfig)) {
            console.log(chalk.red('未检查到.git目录，请尝试先执行 run-sync init 后重试！'));
            return;
        }

        if (!paths.branch) {
            console.log(chalk.red('未检查到环境变量'), chalk.cyan(' TOB_BRANCH '), chalk.red('请将需要同步的参数设置到该环境变量'));
            return;
        }
        const branchCache = path.resolve(paths.cache, paths.branch),
            needFetch=process.env.IS_FORCE==='true'||!await fs.exists(branchCache);

        if(needFetch){
            await runCommand('git', ['fetch', '-p'], {
                cwd: paths.git
            });

            await runCommand('git', ['checkout', '-B', paths.branch, `origin/${paths.branch}`], {
                cwd: paths.git
            });
            await fs.emptyDir(branchCache);
            await fs.copy(paths.code, branchCache);
        }

        await fs.copy(branchCache, paths.target);
        console.log(chalk.green(needFetch?`已经将${paths.branch}分支同步到${paths.target}!`:`${paths.branch}分支缓存存在，已直接复制到${paths.target}!`));
    } catch (e) {
        console.log(chalk.red('发生内部错误，执行失败!'));
        console.log(e);
    }
};
