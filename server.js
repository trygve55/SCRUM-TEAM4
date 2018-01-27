//process.env.NODE_ENV = "production"; //TODO enable this
var http = require('http').createServer(require('./main')).listen(8000);

socket = require('./sockets')(http);
convert = require('./convert');

console.log("Server is listening on port 8000...");