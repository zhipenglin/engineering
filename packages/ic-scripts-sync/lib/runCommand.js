const spawn = require('cross-spawn'),
    chalk = require('chalk');

module.exports = (...args) => {
    return new Promise((resolve, reject) => {
        const child = spawn(...args);

        child.stdout.on('data', (data) => {
            const stdout = data.toString();
            console.log(stdout);
        });

        child.stderr.on('data', (data) => {
            console.log(chalk.red(data.toString()));
        });

        child.on('error', (err) => {
            console.log(err);
            reject();
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject();
            } else {
                resolve();
            }
        });
    });
};
