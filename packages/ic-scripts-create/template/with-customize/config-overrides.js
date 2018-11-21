module.exports=(config,env)=>{
    const rewiredServer = require('@engr/ic-scripts-rewired-server');
    config = rewiredServer(config, env);
    //You can rewired the configuration here.
    return config;
};
