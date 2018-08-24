/**
 * @name: ic-customize-config ;
 * @author: admin ;
 * @description: Parsing the customize file ;
 * */
const fs = require('fs'),
    loadJsonFile = require('load-json-file'),
    path = require('path'),
    get = require('lodash/get'),
    chalk = require('chalk'),
    intersection = require('lodash/intersection');

const appDirectory = fs.realpathSync(process.cwd()),
    customizePath = path.resolve(appDirectory, 'customize.json');

let customize = {};

if (fs.existsSync(customizePath)) {
    try {
        customize = loadJsonFile.sync(customizePath);
    } catch (e) {
        console.log(chalk.red(e.message));
    }
}

let all = get(customize, 'all', []), updateList = get(customize, 'updateList', []);

if (!Array.isArray(all)) {
    console.log(chalk.red('property all must be an array'));
    all = [];
}
if (all.indexOf('common')) {
    all.splice(0, 0, 'common');
}

if (!Array.isArray(updateList)) {
    console.log(chalk.red('property updateList must be an array'));
    updateList = [];
}

updateList = intersection(all, updateList);

module.exports = {
    getTarget: (target)=>{
        if(all.indexOf(target)>-1){
            return target;
        }else{
            return 'common';
        }
    },
    updateList, all,
    getFeatures: (name) => get(customize, `features[${name||'common'}]`, [])
};


