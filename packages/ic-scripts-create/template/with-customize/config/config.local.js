exports.cluster = {
    listen: {
        port: Number(process.env.SERVER_PORT)
    }
};

// 日志路径
exports.logger = {
    level: 'ERROR',
    dir: './logs'
};

exports.apiProxy = {
    forward: {
        renderView: async (ctx) => {
            ctx.body=await ctx.renderVirtual({});
        }
    }
}

// 合并后的配置文件
exports.rundir = './run';
