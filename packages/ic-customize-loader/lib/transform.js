const traverse = require('babel-traverse').default,
    tactics = require('./tactics'),
    rulesMatch = require('./rulesMatch');
module.exports = (resolvePath, ast, rules) => {
    //转换目标路径
    traverse(ast, {
        enter(path) {
            tactics(path.node, (source) => {
                const currentPath = resolvePath[source];
                rulesMatch(rules, source, (test) => {
                    if (currentPath) {
                        source = currentPath;
                    } else {
                        source = source.replace(test, '');
                    }
                });
                return source;
            });
        }
    });
    return ast;
};
