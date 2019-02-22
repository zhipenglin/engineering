/**
 * @name: ic-scripts-rewired-server ;
 * @author: admin ;
 * @description: add rewired webpack config to serevr ;
 * */
const spawn = require('cross-spawn');
const {event} = require('@engr/ic-scripts-util');
const openBrowser = require('react-dev-utils/openBrowser');
const address = require('address').ip();

function createRewiredServer(serverOptions = {startCommand: 'egg-bin dev'}) {
    return (config, env) => {
        if (env === 'development') {
            //检查端口号，如果被占用，自动切到其他端口
            const results = spawn.sync('node', [require.resolve('./lib/getPort.js')]);
            if (results.status === 0) {
                const realPort = results.stdout.toString().trim();
                process.env.PORT = realPort;
            }
            const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
            process.env.openBrowser = false;
            event.on('webpack-start-complete', () => {
                const serverPort = process.env.SERVER_PORT || 7001;
                const list = serverOptions.startCommand.split(' ').filter((command) => !!command),
                    child = spawn('cross-env', [`STATIC_PORT=${process.env.PORT}`, `CUSTOMIZE_TARGET=${process.env.CUSTOMIZE_TARGET}`, ...list]);
                child.stdout.on('data', (data) => {
                    const stdout = data.toString();
                    console.log(stdout);
                    if (stdout.indexOf(`${process.env.npm_package_name} started successfully`) > -1) {
                        openBrowser(`${protocol}://${process.env.HOST || address}:${serverPort}`);
                    }
                });
                child.stderr.on('data', (data) => {
                    console.log(data.toString());
                });
            });
        }
        return config;
    }
}

const rewiredServer = createRewiredServer();

rewiredServer.withOptions = createRewiredServer;

module.exports = rewiredServer;
