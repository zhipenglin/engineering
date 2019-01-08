const spawn = require('cross-spawn');

module.exports = () => {
    return new Promise((resolve, reject) => {
        const ls = spawn('npm', ['config', 'get', 'registry']);
        ls.stdout.on('data',(data)=>{
            resolve(data.toString().trim());
        });
        ls.stderr.on('data',(data)=>{
            reject(data);
        });
    });
};


//npm config get registry
