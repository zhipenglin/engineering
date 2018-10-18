const rulesMatch = require('./rulesMatch');

module.exports=(rules, target)=>{
    let targetArray = [];
    rulesMatch(rules, target, (test, value) => {
        targetArray = value.split(' ').filter((item) => !!item).map((item) =>{
            return {
                name:item.replace(/\$.*/, ''),
                origin:target.replace(test, ''),
                target:target.replace(test, item)
            };
        });
    });
    return targetArray;
};
