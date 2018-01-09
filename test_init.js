var mysql = require('mysql');

pool = mysql.createPool({
    connectionLimit : 2,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'test',
    debug : false
});