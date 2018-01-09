var mysql = require('mysql');

app = require('./main');

chai = require('chai');
request = require('supertest')(app);

pool = mysql.createPool({
    connectionLimit : 2,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'test',
    debug : false
});