var mysql = require('mysql');

app = require('./main');
Cookies = null;

chai = require('chai');
request = require('supertest-session')(app);

pool = mysql.createPool({
    connectionLimit : 2,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'test',
    debug : false
});