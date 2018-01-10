'use strict';

var chai = require('chai').expect;
var user = require('.../api/user_TEMP'); //TODO change back to user.js after manual merge

describe('getUserdata()', function() {
    it('Should return the specified user\'s data', function() {
        // Set up data
        var con;
        var data = ['fn@fake.no', 'Fridtjof',, 'Nansen', '10101861', [1,2,3]];
        con.query('UPDATE person SET ', function(err) {
            if(err) throw err;
        });
        expect();
    });
});

function insertTestPerson() {
    var con;
    var binary = 0x01010100010001010101001101010100;
    var data = ['TEST_EMAIL','TEST_USERNAME_M',binary,binary, 'TEST_FORENAME','TEST_SURNAME','TEST_PHONE','1970-01-01',
        0x0,0,0];
    var sql = 'INSERT INTO person (email, username, password_hash, salt, forename, lastname, phone, birth_date, ' +
        'is_verified, gender, shopping_list_id) VALUES ?';
    con.query(sql, [data], function(err, result) {
        if(err) throw err;
    });
    var personid;
    con.query('SELECT LAST_INSERT_ID()', function(err, result) {
        if(err) throw err;
        personid = result;
    });
    return personid;
}

function deleteTestPerson() {
    var con;
    con.query("DELETE FROM person WHERE username = 'TEST_USERNAME_M'", function(err, result) {
        if(err) throw err;
    });
}