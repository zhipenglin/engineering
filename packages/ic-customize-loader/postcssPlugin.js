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

const transform = (value, rules, basePath) => {
    const urlParser = valueParser(value);
    urlParser.walk((node) => {
        if (node.type === 'function' && node.value === 'url') {
            node.nodes.forEach((target) => {
                if (target.type === 'string') {
                    rulesMatch(rules, target.value, (test) => {
                        const targetPath = resolvePath(target.value, rules, basePath);
                        if (targetPath) {
                            target.value = targetPath;
                        } else {
                            target.value = target.value.replace(test, '');
                        }
                    });
                }
            });
        }
    });
    return urlParser.toString();
};

module.exports = postcss.plugin('customize', options => {
    return (css) => {
        const basePath = path.dirname(css.source.input.file);
        css.walk(rule => {
            if(rule.params){
                rule.params = transform(rule.params, options.rules, basePath);
            }
            rule.walkDecls&&rule.walkDecls(decl => {
                decl.value = transform(decl.value, options.rules, basePath);
            });
        });
    }
});
