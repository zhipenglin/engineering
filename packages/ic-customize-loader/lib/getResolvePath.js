const traverse = require('babel-traverse').default,
    tactics = require('./tactics'),
    getTargetArray=require('./getTargetArray'),
    rulesMatch = require('./rulesMatch');
module.exports = (myResolver, ast, basePath, rules) => {
    //获取需要resolve的路径
    const resolvePath = {}, needResolve = [];
    traverse(ast, {
        enter(path) {
            tactics(path.node, (target) => {
                rulesMatch(rules,target,()=>{
                    needResolve.push(target);
                });
                return target;
            });
        }
    });

    const resolveTargetArray = async (targetArray, target) => {
        for (let target of targetArray) {
            const resolvedPath = await new Promise((resolve) => {
                myResolver(basePath, target, (err, fileName) => {
                    resolve(fileName);
                });
            });
            if (resolvedPath) return resolvedPath;
        }
    };

    //resolve路径并写入resolvePath
    return Promise.all(needResolve.map((target) => {
        return resolveTargetArray(getTargetArray(rules,target)).then((resolvedPath)=>{
            if(resolvedPath){
                resolvePath[target]=resolvedPath;
            }
        });
    })).then(() => resolvePath);
};
