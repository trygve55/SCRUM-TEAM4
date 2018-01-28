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
                        /*pool.query("SELECT COUNT(*) FROM todo WHERE group_id = 1", function(err, result) {
                            if(err) throw err;
                            chai.expect(res.body.length).to.equal(result[0]["COUNT(*)"]);
                        });*/
                    });
            });
        });
    });
    describe('/api/group/ POST functions', function() {
        describe('/api/group/', function() {
            it('should reject bad requests', function(done) {
                request.post('/api/group/').send().expect(400).end(done);
            });
            it('should create a new group ', function(done) {
                request.post("/api/group/").send({
                    group_name: "The Legion",
                    currency: 37
                }).expect(200).end(function(err, res) {
                    pool.query("SELECT COUNT(*) FROM home_group WHERE group_name = 'The Legion'", function(err, result) {
                        if(err) throw err;
                        chai.expect(result[0]["COUNT(*)"]).to.equal(1);
                        done();
                    });
                });
            });
            after('delete group data created in test', function(done) {
                pool.query("SELECT COUNT(*), group_id, shopping_list_id FROM home_group WHERE group_name = 'The Legion'", function(err, result) {
                    if(err) throw err;
                    var data = result[0];
                    if(data["COUNT(*)"] > 0) {
                        pool.query("DELETE FROM group_person WHERE group_id = ?", [data["group_id"]], function(err) {
                            if(err) throw err;
                            pool.query("DELETE FROM home_group WHERE group_id = ?", [data["group_id"]], function(err) {
                                if(err) throw err;
                                pool.query("DELETE FROM shopping_list WHERE shopping_list_id = ?", [data["shopping_list_id"]], function(err) {
                                    if(err) throw err;
                                    done();
                                });
                            });
                        });
                    } else {
                        done();
                    }
                });
            });
        });
        describe('/:group_id/members', function() {
            it('should add the specified users to the group', function(done) {
                request.post('/api/group/1/members')
                    .send({"members": [3,4]})
                    .expect(200)
                    .end(done);
            });
            after('delete added members from test', function() {
                pool.query("DELETE FROM group_person WHERE group_id = 1 AND person_id IN (3,4)", function(err) {
                    if(err) throw err;
                })
            });
        });
    });
    describe('/api/group/ PUT functions', function() {
        describe('/api/group/:group_id', function() {
            it('should update the group info', function(done) {
                var group_name = "SHOULD BE 'test group'",
                    group_desc = "If you're reading this, I am probably dead. Lol jk but actually if you're reading this" +
                        "a test-cleanup failed. group_desc should be 'lol'";
                request.put('/api/group/1')
                    .send({
                        "group_name": group_name,
                        "group_desc": group_desc
                    })
                    .expect(200)
                    .end(function(err, res) {
                        pool.query("SELECT group_name, group_desc FROM home_group WHERE group_id = 1", function(err, result) {
                            if(err) throw err;
                            chai.expect(result[0].group_name).to.equal(group_name);
                            chai.expect(result[0].group_desc).to.equal(group_desc);
                            done();
                        });
                    });
            });
            after('change group 1 back to proper values', function(done) {
                pool.query("UPDATE home_group SET group_name = 'test group', group_desc = 'lol' WHERE group_id = 1", function(err, result) {
                    if(err) throw err;
                    done();
                });
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