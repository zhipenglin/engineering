const paths = require('../lib/paths'),
    runCommand = require('../lib/runCommand'),
    fs = require('fs-extra'),
    chalk = require('chalk');

module.exports = async () => {
    try {
        if (!await fs.exists(paths.gitConfig)) {
            console.log(chalk.red('未检查到.git目录，请尝试先执行 sync-tob init 后重试！'));
            return;
        }

        if (!paths.branch) {
            console.log(chalk.red('未检查到环境变量'), chalk.cyan(' TOB_BRANCH '), chalk.red('请将需要同步的参数设置到该环境变量'));
            return;
        }

        await runCommand('git', ['fetch', '-p'], {
            cwd: paths.git
        });

        await runCommand('git', ['checkout', '-B', paths.branch, `origin/${paths.branch}`], {
            cwd: paths.git
        });
        await fs.copy(paths.code, paths.target);
        console.log(chalk.green(`已经将${paths.branch}分支同步到${paths.target}!`));
    } catch (e) {
        console.log(chalk.red('发生内部错误，执行失败!'));
    }
};
