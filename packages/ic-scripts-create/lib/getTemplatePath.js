const path = require('path'),
    downloadTemplateFromNpm = require('./downloadTemplateFromNpm');

module.exports = async (template, isNpm) => {
    if (isNpm) {
        return path.resolve(await downloadTemplateFromNpm(template), './template');
    } else {
        return path.resolve(__dirname, '../template', template);
    }
};
