/**
 * @name: ic-scripts-rewired-sass2customize ;
 * @author: admin ;
 * @description: make sass support customize ;
 * */

const rewiredPostcss=require('@engr/ic-scripts-rewired-postcss'),
    { getLoader, loaderNameMatches } = require("@engr/ic-scripts-util");

module.exports=function(config,env){
    config=rewiredPostcss((options)=>{
        options.syntax=require.resolve('postcss-scss');
        return options;
    })(config,env);

    const sassRules=getLoader(
        config.module.rules,
        rule => String(rule.test) === String(/\.s(c|a)ss$/),
    );

    const parse=(loader)=>{
        const postcssLoader = getLoader(loader, rule => loaderNameMatches(rule, "postcss-loader")),
            index=loader.indexOf(postcssLoader);
        loader.splice(index,1);
        loader.push(postcssLoader);
        return loader;
    };

    if(env === "production"){
        sassRules.loader=parse(sassRules.loader);
    }else{
        sassRules.use=parse(sassRules.use);
    }

    return config;
};
