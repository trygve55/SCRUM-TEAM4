/**
 * Test for the currency API.
 * Authors: Andrzej Cabala (main author), Magnus Eilertsen
 */
describe('Currency API', function() {
    // Test bad requests.
    describe('/api/currency GET functions',function() {
        it('/ - should return 200', function(done) {
            request.get('/api/currency').expect(200).end(done);
        });
    });
});