#!/usr/bin/env node

const init=require('../scripts/init'),
    sync=require('../scripts/sync'),
    clean=require('../scripts/clean');

require('yargs')
    .command('init','从远程clonetob代码仓库',()=>{
        init();
    })
    .command('sync','同步代码并拷贝到项目',()=>{
        sync();
    })
    .command('clean','清除本地的代码仓库',()=>{
        clean();
    })
    .argv;
