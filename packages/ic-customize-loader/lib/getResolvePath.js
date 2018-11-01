const traverse = require('@babel/traverse').default,
    tactics = require('./tactics'),
    path = require('path'),
    {paths} = require('@engr/ic-scripts-util'),
    getFeatureArray = require('./getFeatureArray'),
    getTargetArray = require('./getTargetArray'),
    transformSrcPath = require('./transformSrcPath'),
    rulesMatch = require('./rulesMatch');
module.exports = (myResolver, ast, basePath, rules, featureOpen = false) => {
    if (basePath.indexOf(paths.appFeature) > -1) {
        //如果该文件在特性包中，先将其指定到src目录再进行解析
        basePath = transformSrcPath(basePath);
    }
    //获取需要resolve的路径
    const resolvePath = {}, needResolve = [];
    traverse(ast, {
        enter(path) {
            tactics(path.node, (target) => {
                rulesMatch(rules, target, () => {
                    needResolve.push(target);
                });
                return target;
            });
        }
    });

    const resolveTargetArray = async (targetArray) => {
        for (let {target, origin, name} of targetArray) {
            let resolvedPath = await new Promise((resolve) => {
                myResolver(basePath, target, (err, fileName) => {
                    resolve(fileName);
                });
            });

            if (resolvedPath) return resolvedPath;

            //如果特性开启，尝试在特性包里继续解析
            if (featureOpen) {
                resolvedPath = await new Promise((resolve, reject) => {
                    //预解析
                    myResolver(basePath, origin, (err, fileName) => {
                        //ic-scripts配置里面加了ModuleScopePlugin，不能直接使用fileName
                        let parseTarget = '';
                        if (err) {
                            //预解析失败，直接去特性包中解析
                            parseTarget = path.join(name, path.relative(paths.appSrc, path.resolve(basePath, origin)));
                        } else {
                            parseTarget = path.join(name, path.relative(paths.appSrc, fileName));
                        }
                        myResolver(basePath, parseTarget, (err, targetPath) => {
                            resolve(targetPath && parseTarget);
                        });
                    });
                });
                if (resolvedPath) return resolvedPath;
            }
        }
    };

    //resolve路径并写入resolvePath
    return Promise.all(needResolve.map((target) => {
        return resolveTargetArray(getFeatureArray(rules, target))
            .then((resolvedPath) => {
                if (resolvedPath) {
                    resolvePath[target] = resolvedPath;
                }
            });
    })).then(() => resolvePath);
};
