const postcss = require('postcss'),
    valueParser = require('postcss-value-parser'),
    getTargetArray = require('./lib/getTargetArray'),
    rulesMatch = require('./lib/rulesMatch'),
    path = require('path'),
    fs = require('fs');

const resolvePath = (targetPath, rules, basePath) => {
    for (let target of getTargetArray(rules, targetPath)) {
        const absoluteTarget = path.resolve(basePath, target);
        if (fs.existsSync(absoluteTarget)) {
            return target;
        }
    }
};

const addSuffix = (value, extname, suffixList) => {
    if (suffixList.indexOf(path.extname(value)) === -1) {
        value += extname;
    }
    return value;
};

const transform = (value, rules, basePath, extname, suffixList) => {
    const urlParser = valueParser(value);
    const parse=(value)=>{
        rulesMatch(rules, value, (test) => {
            const targetPath = resolvePath(addSuffix(value, extname, suffixList), rules, basePath);
            if (targetPath) {
                value = targetPath;
            } else {
                value = value.replace(test, '');
            }
        });
        return value;
    };
    urlParser.walk((node) => {
        if (node.type === 'function' && node.value === 'url') {
            node.nodes.forEach((target) => {
                if (target.type === 'string') {
                    target.value=parse(target.value);
                }
            });
        }else if(node.type==='string'){
            node.value=parse(node.value);
        }
    });
    return urlParser.toString();
};

module.exports = postcss.plugin('customize', options => {
    options = Object.assign({
        rules: [],
        suffix: []
    }, options);
    return (css) => {
        const basePath = path.dirname(css.source.input.file),
            extname = path.extname(css.source.input.file),
            suffixList = ['.css', '.scss', '.sass', '.less', ...options.suffix];

        css.walk(rule => {
            if (rule.params) {
                rule.params = transform(rule.params, options.rules, basePath, extname, suffixList);
            }
            rule.walkDecls && rule.walkDecls(decl => {
                decl.value = transform(decl.value, options.rules, basePath, extname, suffixList);
            });
        });
    }
});
