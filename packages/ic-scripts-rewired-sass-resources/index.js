/**
 * @name: ic-scripts-rewired-sass-resources ;
 * @author: admin ;
 * @description: 给scss加上style-resources-loader ;
 * */
const { getLoader, loaderNameMatches } = require("@engr/ic-scripts-util");

module.exports=function(options){
    options=Object.assign({},options);
    return (config, env)=>{
        const parse = (loader, sassLoader) => {
            const sassLoaderIndex = loader.indexOf(sassLoader);
            const newLoader = loader.slice(0);
            newLoader.splice(sassLoaderIndex + 1, 0, {
                loader: require.resolve('style-resources-loader'),
                options: options
            });
            return newLoader;
        };
        getLoader(config.module.rules, (rule, parentRule) => {
            if (loaderNameMatches(rule, "sass-loader")) {
                if (env === "production") {
                    parentRule.loader = parse(parentRule.loader, rule);
                } else {
                    parentRule.use = parse(parentRule.use, rule);
                }

            }
        });
        return config;
    };
};
