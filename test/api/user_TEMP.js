'use strict';

var chai = require('chai').expect;
var user = require('../../api/user_TEMP'); //TODO change back to user.js after manual merge
var mysql = require('../../mysql');

describe('hooks', function() {
    //before(function() {});

    after(function() {
        pool.getConnection(function(err, connection) {
            if(err) throw err;
            deleteTestPerson(connection);
        });
    });

    //beforeEach(function() {});
    //afterEach(function() {});
});


/*describe('getUserdata()', function() {
    it('Should return the specified user\'s data', function() {
        var con;
        pool.getConnection(function(err, connection){
            if(err) throw err;
            con = connection;
        });
        var data = ['fn@fake.no', 'Fridtjof', 'Dudleif', 'Nansen', '10101861', insertTestPerson(con)];
        var sqlUpdate = 'UPDATE person SET email = ?, firstname = ?, middlename = ?, lastname = ?, phone = ? WHERE person_id = ?';
        con.query(sqlUpdate, [data], function(err) {
            if(err) throw err;
        });
        var selData = getUserdata('TEST_USERNAME_M', con);
        console.log(selData);
        expect(data[0]).to.equal(selData[0]);
        deleteTestPerson(con);
    });
});*/

describe('getUsername()', function() {
    it('Should return the specified email\'s corresponding username', function() {
        pool.getConnection(function(err, connection) {
            if(err) {
                throw err;
                console.log('An error occurred!');
            }
            console.log('connection acquired');
            insertTestPerson(connection);

            var email = getUsername('TEST_EMAIL', connection);
            console.log(email);


            deleteTestPerson(connection);
        });
        console.log('potato');
    });
});

function insertTestPerson(connection) {
    var binary = 0x01010100010001010101001101010100;
    var data = ['TEST_EMAIL','TEST_USERNAME_M',binary,binary, 'TEST_FORENAME','TEST_SURNAME','TEST_PHONE','1970-01-01',
        0x0,0,0];
    var sql = 'INSERT INTO person (email, username, password_hash, salt, forename, lastname, phone, birth_date, ' +
        'is_verified, gender, shopping_list_id) VALUES ?';
    connection.query(sql, [data], function(err, result) {
        if(err) {
            throw err;
            console.log('An error occurred!');
        }
    });
    var personid;
    con.query('SELECT LAST_INSERT_ID()', function(err, result) {
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