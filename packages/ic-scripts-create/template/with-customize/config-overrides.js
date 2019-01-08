const rewiredServer = require('@engr/ic-scripts-rewired-server'),
    rewiredSass2customize = require('@engr/ic-scripts-rewired-sass2customize'),
    rewiredCustomize = require('@engr/ic-scripts-rewired-customize').withLoaderOptions({
        featureOptions: {
            open: true
        }
    });

module.exports = (config, env) => {
    config = rewiredServer(config, env);
    config = rewiredCustomize(config, env);
    config = rewiredSass2customize(config, env);
    //You can rewired the configuration here.
    return config;
};
