const path=require('path');
module.exports = appInfo => {
    const config = {};
    config.keys = appInfo.name + '{%=`_${parseInt(Math.random()*Math.pow(10,13))}_${parseInt(Math.random()*Math.pow(10,4))}`%}';

    config.httpclient = {
        request: {
            timeout: 500000,
        }
    };

    // 日志路径
    config.logger = {
        dir: `/opt/log/${appInfo.name}/logs`
    };

    // 合并后的配置文件
    config.rundir = `/opt/log/${appInfo.name}/run`;

    config.bodyParser = {
        formLimit:'100mb',
        jsonLimit:'100mb',
        qs: {
            parse: (str, opts) => require('querystring').parse(str, null, null, opts)
        }
    };

    config.apiProxy = {
        forward: {
            renderView: async (ctx) => {
                //这里根据定制名称找入口文件需要自己实现逻辑，默认为common
                await ctx.render('/common/index',{});
            }
        }
    };

    // 模板配置
    config.view = {
        // 模板变量
        locals: {
            siteTitle: '{%=alias%}'
        },
        defaultViewEngine: 'nunjucks',
        defaultExtension: '.html',
        root: path.join(appInfo.baseDir, 'build/')
    };

    // 静态资源配置
    config.static = {
        prefix: `{%=public_path%}/`,
        dir: path.join(appInfo.baseDir, 'build/'),
    };

    config.cluster = {
        listen: {
            port:7100
        }
    };

    config.security = {
        csrf: {
            enable: false
        }
    };

    return config;
};
