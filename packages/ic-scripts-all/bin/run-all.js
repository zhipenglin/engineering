#!/usr/bin/env node

const spawn = require('cross-spawn');
const customize = require('@engr/ic-customize-config')(), gitList = require('@engr/ic-gitlib-update-list')();
const args = process.argv.slice(2);
const scriptIndex = args.findIndex(
    x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

const runCommand = (commond, script, env) => {
    const envList = [];
    if (env) {
        envList.push(env);
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
    let updateList = customize.all;
    if (gitList.length > 0) {
        updateList = gitList;
    } else if (customize.updateList.length > 0) {
        process.env.ENV_PATH && require('dotenv').config({path: process.env.ENV_PATH});
        updateList = process.env.CUSTOMIZE_LIST || customize.updateList;
    }
    for (let index = 0; index < updateList.length; index++) {
        const customize = updateList[index];
        //先同步tob分支
        //sync-tob
        const tobBranchMapping = {
            default: {
                value: 'master'
            }
        };
        (process.env.TOB_BRANCH_MAPPGING || '').split(',').filter((str) => {
            const index = str.indexOf(':');
            return index > 0 && index < str.length - 1;
        }).forEach((str) => {
            const [key, value, isForce] = str.split(':');
            tobBranchMapping[key] = {
                value, isForce
            };
        });
        const args = tobBranchMapping[customize] || tobBranchMapping['default'];
        const syncResults = runCommand('sync-tob', 'sync', `TOB_BRANCH=${args.value}&IS_FORCE=${args.isForce ? 'true' : 'false'}`);
        if (syncResults.signal) {
            return process.exit(1);
        }
        const runResults = runCommand('run-scripts', 'build', `CUSTOMIZE_TARGET=${customize}`);
        if (runResults.signal) {
            return process.exit(1);
        }
    }
} else {
    runCommand('run-scripts', script);
}
