const detect = require('detect-port');

detect((err, _port) => {
    console.log(_port);
});
