/*
Author: Magnus Eilertsen
 */

describe('Group API', function() {
    /*describe('/api/group/ POST', function() {
        it('Should reject bad variable names', function(done) {
            request.post('/api/group/').send({
                group_name: "Hackergroup",
                "; DELETE FROM group; ---": "getRekt"
            }).expect(400).end(function(res) {
                console.log(res);
                done();
            });
        });
        it("Should create a group on proper request", function(done) {
            var response;
            request.post('/api/group/').send({
                group_name: "The Legion",
                currency: 87
            }).expect(200).end();
            pool.getConnection(function(err, connection) {
                if(err) throw err;
                var sql = "SELECT COUNT(*) FROM home_group WHERE group_name = 'The Legion'";
                connection.query(sql, function(err, res) {
                    expect(res[0]["COUNT(*)"]).to.equal(1);
                });
                connection.release();
                done();
            });
        });
        after('Deleting test group', function() {
            pool.getConnection(function(err, connection) {
                var group_id;
                if(err) throw err;
                connection.query("SELECT group_id FROM home_group WHERE group_name = 'The Legion'", function(err, res) {
                    if(err) throw err;
                    group_id = res[0].group_id;
                    connection.query("DELETE FROM group_person WHERE group_id = ?", [group_id], function(err, res) {
                        if(err) throw err;
                        connection.query("DELETE FROM home_group WHERE group_id = ?", [group_id], function(err) {
                            if(err) throw err;
                            connection.query("DELETE FROM shopping_list WHERE currency_id = 87", function(err) {
                                if(err) throw err;
                                connection.release();
                            });
                        });
                    });
                });
            });
        });
    });*/

    describe('/api/group/name', function() {
        it('Should tell the group name is in use', function(done) {
            request.get('/api/group/name').query({
                group_name: "test group"
            }).expect(200).expect('false').end(done);
        });
    });
    describe('/api/group/me GET', function() {
        it('Should return the logged in user\'s groups', function(done) {
            request.get('/api/group/me')
                .expect(200)
                .end(function(err, res) {
                    chai.expect(res.body[0].group_name).to.equal("test group");
                    done();
                });
        });
    });
    describe('/api/group/:group_id GET', function() {
        it('should get the requested group\'s info', function(done) {
            request.get('/api/group/1').expect(200).end(function(err, res) {
                chai.expect(res.body[0].group_name).to.equal("test group");
                done();
            });
        });
    });
    describe('/api/group/ GET', function() {
        it('should return the specific group\'s info', function(done) {
            request.get('/api/group/').query({
                group_name: "test group"
            }).expect(200).end(function(err, res) {
                chai.expect(res.body[0].group_name).to.equal("test group");
                done();
            });
        });
        it("should return all the groups' info", function(done) {
            request.get('/api/group/').expect(200).end(function(err, result) {
                pool.getConnection(function(err, connection) {
                    if(err) throw err;
                    connection.query("SELECT COUNT(*) FROM home_group", function(err, res) {
                        if(err) throw err;
                        chai.expect(res[0]["COUNT(*)"]).to.equal(result.body.length);
                        done();
                    });
                });
            });
        });
    });
});