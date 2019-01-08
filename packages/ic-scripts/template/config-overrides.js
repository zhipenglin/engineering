const rewiredServer = require('@engr/ic-scripts-rewired-server');

module.exports = (config, env) => {
    config = rewiredServer(config, env);
    return config;
};
