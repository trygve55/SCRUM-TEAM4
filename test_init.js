var mysql = require('mysql');

app = require('./main');

pool = mysql.createPool({
    connectionLimit : 2,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'test',
    debug : false
});