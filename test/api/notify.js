/**
 * Test for the Notify API.
 * Authors: Andrzej Cabala (main author), Magnus Eilertsen
 */
describe('Notify API', function() {
    // Test bad requests.
    describe('/api/notify GET functions',function() {
        it('/ - should return 200', function(done) {
            request.get('/api/notify').expect(200).end(done);
        });
    });
});