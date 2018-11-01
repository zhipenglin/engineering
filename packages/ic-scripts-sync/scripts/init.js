const paths=require('../lib/paths'),
    fs=require('fs-extra'),
    chalk=require('chalk'),
    runCommand=require('../lib/runCommand');

module.exports=async ()=>{
    await fs.emptyDir(paths.rep);
    await runCommand('git',['clone',paths.url],{
        cwd:paths.rep
    }).then(()=>{
        console.log(chalk.green('初始化成功！已将代码仓库clone到本地'));
    },(e)=>{
        console.log(chalk.red('初始化失败'));
    });
};
