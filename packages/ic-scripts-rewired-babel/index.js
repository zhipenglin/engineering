/**
 * @name: ic-scripts-rewired-babel ;
 * @author: admin ;
 * @description: Configure babel plugins or presets  in Create React App without ejecting ;
 * */

const {getBabelLoader} = require('@engr/ic-scripts-util');

module.exports=function(babelOptions={}){

    return (config,env)=>{
        const babelLoader = getBabelLoader(config.module.rules);

        if (!babelLoader.options.plugins) babelLoader.options.plugins = [];

        if(Array.isArray(babelOptions.plugins)){
            babelLoader.options.plugins.push(...babelOptions.plugins);
        }

        if (!babelLoader.options.presets) babelLoader.options.presets = [];

        if(Array.isArray(babelOptions.presets)){
            babelLoader.options.presets.push(...babelOptions.presets);
        }
        return config;
    }
};
