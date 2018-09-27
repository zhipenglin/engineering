const rulesMatch = require('./rulesMatch');

module.exports=(rules, target)=>{
    let targetArray = [];
    rulesMatch(rules, target, (test, value) => {
        targetArray = value.split(' ').filter((item) => !!item).map((item) => [item.replace(/\$.*/, ''), target.replace(test, '')]);
    });
    return targetArray;
};
