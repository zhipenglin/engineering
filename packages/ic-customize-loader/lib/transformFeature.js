const minimatch = require('minimatch'),
    path = require('path'),
    traverse = require('babel-traverse').default,
    tactics = require('./tactics'),
    transformSrcPath=require('./transformSrcPath'),
    {paths} = require('@engr/ic-scripts-util');

module.exports = async (myResolver, ast, basePath) => {

    const resolveTarget = async (target) => {
        //先尝试解析到当前路径
        let output = await new Promise((resolve) => {
            myResolver(basePath, target, (err, file) => {
                if(err){
                    return resolve();
                }
                if(file.indexOf(paths.appSrc)>-1) {
                    return resolve(file);
                }
                resolve(path.relative(paths.appFeature, file));
            });
        });
        if (output) return output;
        //再解析到源文件夹目录
        output = new Promise((resolve) => {
            myResolver(transformSrcPath(basePath), target, (err, file) => {
                resolve(file);
            });
        });
        return output;
    };

    if (minimatch(basePath, path.join(paths.appFeature, '**/*'))) {
        const needResolve = [], resolvePath = {};
        traverse(ast, {
            enter(path) {
                tactics(path.node, (target) => {
                    if (/^\.{0,2}\//.test(target)) {
                        needResolve.push(target);
                    }
                    return target;
                })
            }
        });

        await Promise.all(needResolve.map((target) => resolveTarget(target).then((output) => {
            if (output) {
                resolvePath[target] = output;
            }
        })));

        traverse(ast, {
            enter(path) {
                tactics(path.node, (source) => {
                    const currentPath = resolvePath[source];
                    if (currentPath) {
                        source = currentPath;
                    }
                    return source;
                });
            }
        });

        return ast;
    }
};
