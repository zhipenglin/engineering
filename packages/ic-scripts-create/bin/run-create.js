#!/usr/bin/env node
const init = require('../scripts/init'),
    template = require('../scripts/template'),
    chalk = require('chalk');

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('init <project-directory>', 'Initialize an application from a template', (yargs) => {
        yargs.positional('project-directory', {
            describe: `Please specify the project directory:\n
            ${chalk.cyan('run-create init')} ${chalk.green('<project-directory>')}\n
            For example:\n
            ${chalk.cyan('run-create init')} ${chalk.green('my-react-app')}\n\n
            Run ${chalk.cyan('run-create')} --help to see all options.\n`,
            type: 'string'
        })
    }, ({projectDirectory}) => {
        init(projectDirectory).catch((e) => {
            console.log(chalk.red(e));
        });
    })
    .command('template [options]', 'Manage custom template', (yargs) => {
        yargs.positional('options', {
            describe: `Template operating options,For example:\n
            ${chalk.cyan('run-create template')} ${chalk.green('ls')} - Display template list\n
            ${chalk.cyan('run-create template')} ${chalk.green('rm')} - Delete a template\n
            ${chalk.cyan('run-create template')} ${chalk.green('add')} - Add a template.\n`,
            choices: ['ls', 'rm', 'add'],
            default: 'ls',
            type: 'string'
        })
    }, ({options}) => {
        template(options).catch((e) => {
            console.log(chalk.red(e));
        });
    })
    .demandCommand()
    .help()
    .argv;


