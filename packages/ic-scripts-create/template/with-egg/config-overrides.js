const rewiredServer = require('@engr/ic-scripts-rewired-server');

module.exports=(config,env)=>{
    config = rewiredServer(config, env);
    //You can rewired the configuration here.
    return config;
};
