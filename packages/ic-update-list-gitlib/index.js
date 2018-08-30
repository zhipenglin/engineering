/**
 * @name: ic-update-list-gitlib ;
 * @author: admin ;
 * @description: 从gitlib的合并中获取updateList ;
 * */

const spawn=require('cross-spawn'),
    all=require('@engr/ic-customize-config').all,intersection = require('lodash/intersection');

module.exports=function(){
    const result=spawn.sync('git',['log','-1']);
    if (result.status === 0) {
        const  msg = result.stdout.toString();
        const match=msg.replace(/[\n\r]/g,'').match(/Merge branch .* into \'release\/[0-9]{8}\'.*\$\{(.*)\}.*See merge request/);
        if(match&&match[1]){
            if(match[1]==='*'){
                return all.slice(0);
            }
            return intersection(all,match[1].replace(/\s/g,'').split(','));
        }
    }
    return [];
};
