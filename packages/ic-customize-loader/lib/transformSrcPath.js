const path = require('path'), {paths} = require('@engr/ic-scripts-util');

module.exports = (basePath) => {
    const targetPaths = path.relative(path.join(paths.appFeature), basePath).split(path.sep);
    targetPaths.splice(0, 1);
    const transformPath = targetPaths.join(path.sep);
    return path.resolve(paths.appSrc, transformPath);
};
