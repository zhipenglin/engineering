module.exports = (node, func) => {
    //判断当前语法节点是否是require或import语句
    if (node.type === 'CallExpression' && node.callee && (node.callee.name === 'require' || node.callee.type === 'Import')) {
        node.arguments[0].value = func(node.arguments[0].value);
    } else if (node.type === "ImportDeclaration") {
        node.source.value = func(node.source.value);
    }
};
