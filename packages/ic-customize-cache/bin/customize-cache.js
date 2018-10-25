#!/usr/bin/env node

const run = require('../scripts/run'),chalk = require('chalk');

run().catch((e) => {
    console.log(chalk.red(e.message));
    process.exit(1);
});
