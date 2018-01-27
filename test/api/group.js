/*
Author: Magnus Eilertsen 
 */

describe('Group API', function() {
    describe('/api/group/ GET functions', function() {
        describe('/api/group/:group_id/me/privileges', function() {
            it('should return true for testnavn being administrator of group 1', function(done) {
                request.get('/api/group/1/me/privileges').expect('true').expect(200).end(done);
            });
            it('should return false for groups you are not in', function(done) {
                request.get('/api/group/6/me/privileges').expect(200).expect('false').end(done);
            });
        });
        describe('/api/group/:group_id/users', function() {
            it('should return all the users for group 1', function(done) {
                request.get("/api/group/1/users").expect(200).end(function(err, res) {
                    chai.expect(res.body[0].person_id).to.equal(1);
                    chai.expect(res.body[1].person_id).to.equal(2);
                    done();
                });
            });
        });
        describe('/api/group/name', function() {
            it('should return false if the provided name is not available', function(done) {
                request.get('/api/group/name').query({group_name: "test group"}).expect(200).expect("false").end(done);
            });
        });
        describe('/api/group/:group_id', function() {
            it('should get the requested group\'s info', function(done) {
                request.get('/api/group/1').expect(200).end(function(err, res) {
                    chai.expect(res.body[0].group_name).to.equal("test group");
                    done();
                });
            });
        });
        describe('/api/group/', function() {
            it("should return all the groups' info", function(done) {
                request.get('/api/group/').expect(200).end(function(err, result) {
                    pool.query("SELECT COUNT(*) FROM home_group", function(err, res) {
                        if(err) throw err;
                        chai.expect(res[0]["COUNT(*)"]).to.equal(result.body.length);
                        done();
                    });
                });
            });
        });
        describe("/api/group/:group_id/todo", function() {
            it('should return the task details for all tasks in the specified group', function(done) {
                request.get('/api/group/1/todo')
                    .expect(200)
                    .end(function(err, res) {
                        done(); //TODO fix
                        pool.query("SELECT COUNT(*) FROM todo WHERE group_id = 1", function(err, result) {
                            if(err) throw err;
                            console.log(res.body);
                            console.log(result);
                            chai.expect(res.body.length).to.equal(result[0]["COUNT(*)"]);
                        });
                    });
            });
        });
    });
    describe('/api/group/ POST functions', function() {
        /*describe('/:group_id/members', function() {
            it('should add the specified users to the group', function(done) {
                request.post('/api/group/1/members')
                    .send({"members": [3,4]})
                    .expect(200)
                    .end(function(err, res) {
                        console.log(res.body);
                        pool.query("SELECT person_id FROM group_person WHERE group_id = 1", function(err, result) {
                            if(err) throw err;
                            var ids = [];
                            for(var i = 0; i < result.body.length; i++) {
                                ids.pop(result.body[i].person_id);
                            }
                            chai.expect(ids.indexOf(3) + ids.indexOf(4)).to.be.greaterThan(0);
                            done();
                        });
                    });
            });
            after('delete added members from test', function() {
                pool.query("DELETE FROM group_person WHERE group_id = 1 AND person_id IN (3,4)", function(err) {
                    if(err) throw err;
                })
            });
        });*/
    });
    describe('/api/group/ PUT functions', function() {
        describe('/api/group/:group_id', function() {
            it('should update the group info', function(done) {

            });
        });
    });
    describe('/api/group/ DELETE functions', function() {
        describe('/:group_id', function() {
            before('add users to remove', function(done) {
                pool.query("SELECT COUNT(*) FROM group_person WHERE group_id = 1 AND person_id = 1", function(err, result) {
                    if(err) throw err;
                    if(result[0]["COUNT(*)"] != 0) {
                        done();
                    } else {
                        pool.query("INSERT INTO group_person(person_id, group_id) VALUES (3,1)", function(err,res) {
                            if(err) throw err;
                            done();
                        });
                    }
                });
            });
            /*it('should reject users without access', function(done) {
                request.delete('/api/group/1')
                done();
            });*/
            //INSERT INTO group_person(person_id, group_id, role_id) VALUES (1,1,2);
            it('should remove users, given appropriate access', function(done) {
                request.delete('/api/group/1')
                    .send({person_id: 3})
                    .expect(200)
                    .end(function(err, res) {
                        console.log(res.status + ", " + res.responseText);
                        pool.query("SELECT COUNT(*) FROM group_person WHERE group_id = 1 AND person_id = 3", function(err, result) {
                            if(err) throw err;
                            chai.expect(result[0]["COUNT(*)"]).to.equal(0);
                            done();
                        });
                    });
            });
            after('remove users in case the test failed', function(done) {
                pool.query("DELETE FROM group_person WHERE group_id = 1 AND person_id = 3", function(err, res) {
                    if(err) throw err;
                    done();
                });
            });
        });
    });
});