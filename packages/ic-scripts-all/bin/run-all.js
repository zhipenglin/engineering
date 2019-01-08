#!/usr/bin/env node

const spawn = require('cross-spawn');
const customize = require('@engr/ic-customize-config')(), gitList = require('@engr/ic-gitlib-update-list')();
const {parse} = require('ic-args');
const args = process.argv.slice(2);
const path = require('path');
const scriptIndex = args.findIndex(
    x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

const runCommand = (commond, script, ...env) => {
    let envList = [];
    if (env) {
        envList = env;
    }
    const results = spawn.sync(
        'cross-env',
        envList.concat(commond, ...nodeArgs)
            .concat(script)
            .concat(args.slice(scriptIndex + 1)),
        {stdio: 'inherit'}
    );
    if (results.error) {
        console.log(results.error);
        process.exit(1);
    }
    return results;
};

if (script === 'build' && customize.isCustomize) {
    require('dotenv').config({path: process.env.ENV_PATH || path.resolve(process.cwd(), '.env.local')});

    let updateList = customize.updateList || customize.all;
    if (gitList.length > 0) {
        updateList = gitList;
    }
    const customizeList = customize.formatUpdateList((process.env.CUSTOMIZE_LIST || '').split(','));
    if (customizeList.length > 0) {
        updateList = customizeList;
    }
    for (let index = 0; index < updateList.length; index++) {
        const customize = updateList[index];
        //先同步tob分支
        //sync-tob
        if (process.env.TOB_BRANCH_MAPPGING) {
            const tobBranchMapping = Object.assign({
                default: {
                    value: 'master'
                }
            }, parse(process.env.TOB_BRANCH_MAPPGING, ['value', 'isForce']));
            const args = tobBranchMapping[customize] || tobBranchMapping['default'];
            const syncResults = runCommand('run-sync', 'sync', `TOB_BRANCH=${args.value}`, `IS_FORCE=${args.isForce ? 'true' : 'false'}`);
            if (syncResults.signal) {
                return process.exit(1);
            }
        }
        const cdnList = parse(process.env.CDN_LIST), envList = [`CUSTOMIZE_TARGET=${customize}`];
        if(cdnList[customize]){
            envList.push(`PUBLIC_URL=${cdnList[customize]}`);
        }
        const runResults = runCommand('run-scripts', 'build', ...envList);
        if (runResults.signal) {
            return process.exit(1);
        }
    }
} else {
    runCommand('run-scripts', script);
}
