const path = require('path'),
    fs = require('fs-extra'),
    repDir = path.resolve(__dirname, '../.tob-repo'),
    appDir = fs.realpathSync(process.cwd());

require('dotenv').config();

module.exports = {
    url: 'http://192.168.1.199:8080/web/fe.git',
    app: appDir,
    branch: process.env.TOB_BRANCH,
    cache: path.resolve(__dirname, '../.cache'),
    target: path.resolve(appDir, process.env.TOB_TARGET || 'src/tob'),
    rep: repDir,
    git: path.resolve(repDir, 'fe/'),
    gitConfig: path.resolve(repDir, 'fe/.git'),
    code: path.resolve(repDir, 'fe/static')
};
