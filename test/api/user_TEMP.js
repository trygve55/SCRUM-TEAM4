'use strict';

var chai = require('chai').expect;
var user = require('../../api/user_TEMP'); //TODO change back to user.js after manual merge
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 2,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'test',
    debug : false
});

describe('#user_TEMP.js', function() {
    it('should return the requested user\'s data', function(done) {
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            deleteTestPerson(connection);
            insertTestPerson(connection);
            request.post('/api/user_TEMP/getUser').send({
                username: 'TEST_USERNAME_M'
            }).expect(function(res) {
                res.body[0].person_id = 2;
            }).expect([{email: "TEST_EMAIL",
                forename: 'TEST_FORENAME',
                middlename: null,
                lastname: 'TEST_SURNAME',
                phone: 'TEST_PHONE',
                person_id: 2
            }]).end(done);
        });
    });
});

function insertTestPerson(connection) {
    console.log('insertTestPerson() called');
    var binary = 0x01010100010001010101001101010100;
    var data = [['TEST_EMAIL','TEST_USERNAME_M',binary, 'TEST_FORENAME','TEST_SURNAME','TEST_PHONE','1970-01-01',
        0x0,0,0]];
    var sql = 'INSERT INTO person (email, username, password_hash, forename, lastname, phone, birth_date, ' +
        'is_verified, gender, shopping_list_id) VALUES ?';
    connection.query(sql, [data], function(err, result) {
        if(err) {
            console.log('An error occurred!');
            throw err;
        } else {
            console.log('query succesfully sent');
        }
    });
    var personid;
    connection.query('SELECT LAST_INSERT_ID()', function(err, result) {
        if(err) throw err;
        personid = result;
    });
    return personid;
}

function deleteTestPerson(connection) {
    connection.query("DELETE FROM person WHERE username = 'TEST_USERNAME_M'", function(err, result) {
        if(err) throw err;
    });
}