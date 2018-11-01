const fs = require('fs-extra'),
    chalk = require('chalk'),
    paths=require('../lib/paths');
module.exports=async ()=>{
    await fs.emptyDir(paths.rep);
    console.log(chalk.green('已删除代码仓库'));
};
