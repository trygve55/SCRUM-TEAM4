var http = require('http').createServer(require('./main')).listen(8000);
socket = require('./sockets')(http);
console.log("Server is listening on port 8000...");