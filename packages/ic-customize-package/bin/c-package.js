#!/usr/bin/env node
const config = require('@engr/ic-customize-config')(),
    fs = require('fs-extra'),
    {paths} = require('@engr/ic-scripts-util'),
    {pack, unpack} = require('../lib/run');


(async () => {
    const all = config.all,
        featureList = await fs.exists(paths.appFeature) ? await fs.readdir(paths.appFeature) : [];
    all.filter((name) => name === 'common');

    const argv = require('yargs')
        .command('pack [name]', 'pack feature', (yargs) => {
            yargs.positional('name', {
                describe: 'feature name',
                choices: [...all, ...config.features
                ],
                type: 'string'
            })
        }, ({name}) => {
            if (!name) {
                console.log('A feature name parameter must be passed in.');
                return;
            }
            pack(name).catch((err) => {
                console.log(err);
            });
        })
        .command('unpack [name]', 'unpack feature', (yargs) => {
            yargs.positional('name', {
                describe: 'feature name',
                choices: featureList
            })
        }, ({name}) => {
            if (!name) {
                console.log('A feature name parameter must be passed in.');
                return;
            }
            unpack(name).catch((err) => {
                console.log(err);
            });
        })
        .demandCommand(1, 'You need at least one command before moving on')
        .help()
        .argv;
})().catch((e) => {
    console.log(e);
});


