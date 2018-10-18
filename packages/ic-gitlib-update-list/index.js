/**
 * @name: ic-gitlib-update-list ;
 * @author: admin ;
 * @description: 从gitlib的合并中获取updateList ;
 * */

const spawn = require('cross-spawn'),
    chalk = require('chalk'),
    customizeConfig = require('@engr/ic-customize-config');

module.exports = function () {
    const {isCustomize, all, formatUpdateList} = customizeConfig();
    if (!isCustomize) {
        console.log(chalk.yellow('该项目为非定制项目，跳过解析'));
        return [];
    }
    const result = spawn.sync('git', ['log', '-1']);
    if (result.status === 0) {
        const msg = result.stdout.toString();
        const match = msg.replace(/[\n\r]/g, '').match(/Merge branch .* into \'(release|hotfix)\/[0-9]{8}\'.*\$\{(.*)\}.*See merge request/);
        if (match && match[1]) {
            if (match[1] === '*') {
                return all.slice(0);
            }
            return formatUpdateList(match[1].replace(/\s/g, '').split(','));
        }
    }
    return [];
};
