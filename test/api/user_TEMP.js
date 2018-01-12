'use strict';

var chai = require('chai').expect;
//var user = require('../../api/user_TEMP'); //TODO change back to user.js after manual merge
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
    describe('/api/user_TEMP/getUser', function() {
        it('should return the requested user\'s data', function(done) {
            pool.getConnection(function(err, connection) {
                if(err) throw err;
                request.post('/api/user_TEMP/getUser').send({
                    variables: ['username', 'forename', 'lastname'],
                    users: [1,2]
                }).expect([{
                    username: 'testnavn',
                    forename: 'test',
                    lastname: 'test'
                }, {
                    username: 'facebook',
                    forename: 'test',
                    lastname: 'test'
                }]).end(done);
            });
        });
        it('should return 403 "Forbidden request" on invalid request', function(done) {
            // TODO set session ID to 300, test will not work correctly until this is applied
            request.post('/api/user_TEMP/getUser').send({
                variables: ['username', 'forename', 'lastname', 'email'],
                users: [300, 403]
            }).expect(403).end();
            request.post('/api/user_TEMP/getUser').send({
                variables: ['username', 'forename', 'lastname', 'email'],
                users: [300, 403]
            }).expect(403).end(done);
            request.post('/api/user_TEMP/getUser').send({
                variables: ['username', 'forename', 'lastname'],
                users: [300, 403]
            }).expect(200).end(done);
        });
    });

    /*
    describe('#checkRequestArray()', function() {
        var test_valid = ['person_id', 'gender', 'user_deactivated'];
        var test_invalidTwo = ['potato', 'Grand Master', 'person_id'];
        var test1 = user.checkRequestArray(test_valid),
            test2 = user.checkRequestArray(test_invalidTwo);
        Chai.expect(test1).to.equal(0);
        Chai.expect(test2).to.equal(2);
    });
    */
});

function insertTestPerson(connection) {
    var binary = 0x01010100010001010101001101010100;
    var data = [['TEST_EMAIL','TEST_USERNAME_M',binary, 'TEST_FORENAME','TEST_SURNAME','TEST_PHONE','1970-01-01',
        0x0,0,0]];
    var sql = 'INSERT INTO person (email, username, password_hash, forename, lastname, phone, birth_date, ' +
        'is_verified, gender, shopping_list_id) VALUES ?';
    connection.query(sql, [data], function(err, result) {
        if(err) {
            throw err;
        } else {

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