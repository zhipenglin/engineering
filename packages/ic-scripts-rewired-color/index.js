/**
 * @name: ic-scripts-rewired-color ;
 * @author: admin ;
 * @description: 替换颜色，实现不同定制的定制化主题色 ;
 * */
const postcssRewired = require('@engr/ic-scripts-rewired-postcss'),
    postcss = require('postcss');

const transform = (value, source, target) => {
    for (let item of source) {
        if (typeof value === 'string' && value.toLowerCase().indexOf(item) > -1) {
            return value.toLowerCase().replace(item, target);
        }
    }
    return value;
};

function createRewiredColor(colorOptions = {mapping: []}) {
    return function (config, env) {
        if (colorOptions.mapping && colorOptions.mapping.length > 0) {
            config = postcssRewired((options) => {
                const plugins = options.plugins();
                plugins.push(postcss.plugin('color', (options) => {
                    return css => {
                        css.walkDecls((decl) => {
                            colorOptions.mapping.forEach(({source, target}) => {
                                if (typeof source === 'string') {
                                    source = [source];
                                }
                                if (!Array.isArray(source)) {
                                    throw new Error('source必须为数组或字符串');
                                }
                                decl.value = transform(decl.value, source, target);
                            });
                        });
                    }
                }));
                options.plugins = () => plugins;
                return options;
            })(config, env);
        } else {
            console.warn('插件参数mapping可能没有被配置');
        }
        return config;
    }
}

module.exports = createRewiredColor;
