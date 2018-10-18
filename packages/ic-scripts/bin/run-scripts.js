#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const spawn = require('cross-spawn');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
    x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

const runCommand = (script, nodeArgs, env) => {
    const command = [];
    if (env) {
        command.push(env);
    }
    const result = spawn.sync(
        'cross-env',
        command.concat('node', ...nodeArgs)
            .concat(require.resolve('../scripts/' + script))
            .concat(args.slice(scriptIndex + 1)),
        {stdio: 'inherit'}
    );
    if (result.error) {
        console.log(result.error);
        process.exit(1);
    }
    if (result.signal) {
        if (result.signal === 'SIGKILL') {
            console.log(
                'The build failed because the process exited too early. ' +
                'This probably means the system ran out of memory or someone called ' +
                '`kill -9` on the process.'
            );
        } else if (result.signal === 'SIGTERM') {
            console.log(
                'The build failed because the process exited too early. ' +
                'Someone might have called `kill` or `killall`, or the system could ' +
                'be shutting down.'
            );
        }
        process.exit(1);
    }
};

const customize = require('@engr/ic-customize-config')(), gitList = require('@engr/ic-gitlib-update-list')();

switch (script) {
    case 'start':
    case 'test': {
        runCommand(script, nodeArgs);
        break;
    }
    case 'build':
        if (customize.isCustomize === true) {
            let updateList = customize.all;
            if (gitList.length > 0) {
                updateList = gitList;
            } else if (customize.updateList.length > 0) {
                updateList = customize.updateList;
            }
            updateList.forEach((target) => {
                runCommand(script, nodeArgs, `CUSTOMIZE_TARGET=${target}`);
            });
        } else {
            runCommand(script, nodeArgs);
        }
        break;
    default:
        console.log('Unknown script "' + script + '".');
        console.log('Perhaps you need to update react-scripts?');
        console.log(
            'See: https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#updating-to-new-releases'
        );
        break;
}
