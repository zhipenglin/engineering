/**
 * @name: ic-scripts-rewired-babel ;
 * @author: admin ;
 * @description: Configure babel plugins or presets  in Create React App without ejecting ;
 * */

const {getBabelLoader} = require('@engr/ic-scripts-util');

module.exports = function (babelOptions = {}) {

    return (config, env) => {
        const babelLoader = getBabelLoader(config.module.rules);

        if (Array.isArray(babelOptions.plugins)) {
            babelLoader.options.plugins = [...babelOptions.plugins];
        }

        if (Array.isArray(babelOptions.presets)) {
            babelLoader.options.presets = [...babelOptions.presets];
        }

        const {plugins,presets,...others}=babelOptions;

        Object.assign(babelLoader,others);
        return config;
    }
};
