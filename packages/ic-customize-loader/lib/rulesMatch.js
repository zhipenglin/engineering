module.exports = (rules, source, func) => {
    //匹配用户规则
    rules.forEach(({test, value = ''}) => {
        if (test instanceof RegExp ? (new RegExp(test)).test(source) : test === source) {
            func(test, value);
        }
    });
};
