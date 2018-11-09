const rewiredSass = require('@engr/ic-scripts-rewired-sass'),
    rewiredServer = require('@engr/ic-scripts-rewired-server');

module.exports = (config, env) => {
    config = rewiredSass(config, env);
    config = rewiredServer(config, env);
    return config;
};
