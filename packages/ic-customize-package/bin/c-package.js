#!/usr/bin/env node
const config = require('@engr/ic-customize-config')(),
    fs = require('fs-extra'),
    {paths} = require('@engr/ic-scripts-util'),
    {pack, unpack, analyze, merge} = require('../lib/run');


(async () => {
    const all = config.all,
        featureList = await fs.exists(paths.appFeature) ? await fs.readdir(paths.appFeature) : [];

    const argv = require('yargs')
        .command('pack <name>', 'pack feature', (yargs) => {
            yargs.positional('name', {
                describe: 'feature name',
                choices: [...all, ...config.features].filter((item) => item !== 'common'),
                type: 'string'
            })
        }, ({name}) => {
            pack(name).catch((err) => {
                console.log(err);
            });
        })
        .command('unpack <name>', 'unpack feature', (yargs) => {
            yargs.positional('name', {
                describe: 'feature name',
                choices: featureList,
                type: 'string'
            })
        }, ({name}) => {
            unpack(name).catch((err) => {
                console.log(err);
            });
        })
        .command('analyze [scope]', 'Analyzing the relationship between customization and features.', (yargs) => {
            yargs.positional('scope', {
                describe: 'scope of analysis',
                choices: [...all, ...config.features].filter((item) => item !== 'common'),
                type: 'string'
            })
        }, ({scope}) => {
            analyze(scope).catch((err) => console.log(err));
        })
        /*.command('merge <base> <target>', 'Merge one feature into another.', (yargs) => {
            yargs.positional('base', {
                describe: 'base of merging',
                choices: config.features,
                type: 'string'
            }).positional('target', {
                describe: 'target of merging',
                choices: config.features,
                type: 'string'
            }).option('name', {
                describe: 'A new feature name',
                type: 'string'
            });
        }, ({base, target, name}) => {
            merge({base, target, name}).catch((err) => console.log(err));
        })*/
        .demandCommand(1, 'You need at least one command before moving on')
        .help()
        .argv;
})().catch((e) => {
    console.log(e);
});


