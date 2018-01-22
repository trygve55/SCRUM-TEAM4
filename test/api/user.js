var fs = require('fs');
var jwt = require('jsonwebtoken');

describe('User API', function() {
    describe('/api/user/register POST', function () {
        it("Should register a user", function (done) {
            request.post('/api/user/register')
                .send({
                    email:"test2@test2.no",
                    username:"test2",
                    password:"hei",
                    forename:"testperson",
                    lastname:"testperson"
                    })
                .expect(200)
                .expect({message: 'Transaction successful'})
                .end(function(){
                    pool.getConnection(function (err, connection) {
                        if (err) throw err;
                        connection.query('DELETE FROM person WHERE username = "test2"', function (err) {
                           if (err) throw err;
                           connection.release();
                           done();
                        });
                    });
                });
        });
    });

    describe('/api/user/user GET', function () {
       it("Should return if username is valid", function (done) {
          request.get('/api/user/user')
              .query({
                  username: ["testbrukeren0"]
              })
              .expect(200)
              .expect({message: "Username valid"})
              .end(done);
       });
    });

    describe('/api/user/mail GET', function () {
        it("Should return if email is valid", function (done) {
            request.get('/api/user/mail')
                .query({
                    email: ["testbruker@test.no"]
                })
                .expect(200)
                .expect({message: "E-mail valid"})
                .end(done);
        });
    });

    describe('/api/user/:person_id PUT', function() {
        it("Should update values", function (done) {
           var userEdit = {forename: "test2"};
           request.put('/api/user/1')
               .send(userEdit)
               .expect(200)
               .expect({success: "test2"})
               .end(function () {
                   pool.getConnection(function (err, connection) {
                       if(err) throw err;
                       connection.query('UPDATE person SET forename = "test" WHERE username = "testnavn"', function (err) {
                           connection.release();
                           if (err) throw err;
                           done();
                       })
                   })
               });
        });
    });

    function getFileSizeInBytes(filename) {
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes;
    }

    describe('/api/:person_id/picture POST', function () {
        it("Should return same size as image", function (done) {
            request.post('/api/user/1/picture')
                .attach('file', 'test/img/test.jpg')
                .expect(200)
                .expect(getFileSizeInBytes('test/img/test.jpg')) //TODO: make it return actual size? ish?
                .end(function(){
                    pool.getConnection(function (err, connection) {
                        if (err) throw err;
                        connection.query('UPDATE person ' +
                            'SET profile_pic = null, profile_pic_tiny = null ' +
                            'WHERE person_id = 1;', function () {
                            connection.release();
                            if (err) throw err;
                            done();
                        });
                    });
                });
        });
    });

/*
    describe('/:person_id/picture', function () {
       it("Should return something", function (done) {
            request.get('/api/user/1/picture')
                .send()
        });
    });
*/

    describe('/api/user/all GET', function () {
       it("Should return expected values from database", function (done) {
           request.get('/api/user/all')
               .expect(200)
               .expect([
                   {
                       "person_id": 1,
                       "email": "test@test.com",
                       "forename": "test",
                       "middlename": null,
                       "lastname": "test",
                       "username": "testnavn"
                   },
                   {
                       "person_id": 2,
                       "email": "facebook@test.com",
                       "forename": "test",
                       "middlename": null,
                       "lastname": "test",
                       "username": "facebook"
                   }
               ])
               .end(done);
       });
    });

    describe('/api/user/getUser GET', function () {
        it("Should return the requested user's data (private)", function (done) {
            request.get('/api/user/getUser').query({
                variables: ["phone", "email"]
            }).expect([{
                phone: '23456',
                email: 'test@test.com'
            }]).expect(200)
                .end(done);

        });
        it("Should return the requested users' data (public)", function(done) {
            request.get('/api/user/getUser').query({
                variables: ["forename", "lastname"],
                users: [1,2]
            }).expect([{
                forename: "test",
                lastname: "test"
            }, {
                forename: "test",
                lastname: "test"
            }]).expect(200).end(done);
        });
        it("Should return 400 on bad request(nonsense variables)", function (done) {
            request.get('/api/user/getUser').query({
                variables: ["notarealvariable", "alsonotarealvariable"],
                users: ["notanumber", "alsonot"]
            }).expect(400).end(done);
        });
        it("Should return 403 on request for multiple users' private data", function (done) {
            request.get('/api/user/getUser').query({
                variables: ["username", "email", "phone"],
                users: [1, 2]
            }).expect(403).end(done);
        });
        it("Should return 403 on requesting other users' private data", function (done) {
            request.get('/api/user/getUser').query({
                variables: ["email", "phone"],
                users: [2]
            }).expect(403).end(done);
        });
    });

    describe('/api/user/forgottenPasswordEmail POST', function() {
        it('should reject requests without an email variable', function(done) {
            request.post('/api/user/forgottenPasswordEmail').send().expect(400).end(done);
        });
        it('should reject requests with a bad email variable', function(done) {
            request.post('/api/user/forgottenPasswordEmail').send({email: "d9k0ask@amskd.soq"}).expect(404).end(done);
        });
    });

    /*describe('/api/user/forgottenPasswordReset', function() { //TODO fix test
        it('should change the password for a dummy user', function(done) {
            pool.getConnection(function(err, connection) {
                if(err) throw err;
                connection.query("INSERT INTO shopping_list(shopping_list_name, currency_id) VALUES ('THISLISTISATEST', 5)", function(err, res) {
                    if(err) {
                        connection.release();
                        throw err;
                    }
                    var shopping_list_id = res.insertId,
                        values = ["DELETE_THIS@IF.FOUND", "UnitTestUser", "TESTFAIL", "Shouldnt", "BeSeen", shopping_list_id];
                    connection.query("INSERT INTO person(email, username, password_hash, forename, lastname, shopping_list_id) VALUES (" +
                        "?,?,?,?,?,?)", values, function(err, res) {
                        if(err) {
                            connection.release();
                            throw err;
                        }
                        var secret = 'test secret',
                            person_id = res.insertId,
                            token = jwt.sign({
                                id: person_id
                            }, secret);
                        console.log("TEST: person_id = " + person_id);
                        connection.query("UPDATE person SET reset_password_token = ? WHERE person_id = ?", [token, person_id], function(err) {
                            if(err) {
                                connection.release();
                                throw err;
                            }
                            request.post('/api/user/forgottenPasswordReset')
                                .query({token: token})
                                .send({new_password: "test success"})
                                .expect(200)
                                .end(function(err, res) {
                                    console.log("Status code: " + res.statusCode);
                                    //console.log(res);
                                    connection.query("SELECT password_hash FROM person WHERE person_id = ?", [person_id],function(err, res) {
                                        if(err) {
                                            connection.release();
                                            throw err;
                                        }
                                        chai.expect(res[0].password_hash).to.not.equal("TESTFAIL");
                                        connection.release();
                                        done();
                                    });
                            });
                        });
                    });
                });
            });
        });
        after('delete potential test person', function() {
            pool.getConnection(function(err, connection) {
                if(err) throw err;
                connection.query("DELETE FROM person WHERE username = 'UnitTestUser'", function(err) {
                    if(err) {
                        connection.release();
                        throw err;
                    }
                    console.log("Test person should be gone, shopping list hopefully following");
                    connection.query("DELETE FROM shopping_list WHERE shopping_list_name = 'THISLISTISATEST'", function(err) {
                        if(err) {
                            connection.release();
                            throw err;
                        }
                        console.log("If the test person isn't deleted now, so help me God");
                        connection.release();
                    })
                })
            })
        });
    });*/
});