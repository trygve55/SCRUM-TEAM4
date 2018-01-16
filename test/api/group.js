/*
Author: Magnus Eilertsen
 */

describe('Group API', function() {
    describe('/api/group/ POST', function() {
        it('Should reject bad variable names', function(done) {
            request.post('/api/group/').send({
                group_name: "Hackergroup",
                "; DELETE FROM group; ---": "getRekt"
            }).expect(400).end(done);
        });
    });
    describe('/api/group/ GET', function() {

    });
    describe('/api/group/ SOMETHING', function() {

    });
});