const path=require('path'),paths=require('./paths');

module.exports=path.join(paths.appBuild,process.env.CUSTOMIZE_TARGET||'');
