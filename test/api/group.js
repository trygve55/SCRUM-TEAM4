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
    });

});