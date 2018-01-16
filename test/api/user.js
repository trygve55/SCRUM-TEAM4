
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
                        connection.query('DELETE FROM person WHERE username = "test2"', function (err, result) {
                           if (err) throw err;
                           connection.release();
                           done();
                        });
                    });
                });
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
});