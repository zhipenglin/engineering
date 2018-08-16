const port = process.argv[2];
const detect = require('detect-port');

detect(port, (err, _port) => {
    console.log(_port);
});
