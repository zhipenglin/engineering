const parser = require('@babel/parser');

module.exports = (content) => {
    return parser.parse(content, {
        sourceType: "module",
        plugins: ["dynamicImport", "jsx"]
    });
};
