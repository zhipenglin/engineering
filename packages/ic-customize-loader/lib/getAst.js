const babylon = require('babylon');

module.exports = (content) => {
    return babylon.parse(content, {
        sourceType: "module",
        plugins: ["dynamicImport", "jsx"]
    });
};
