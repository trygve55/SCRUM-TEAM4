'use strict';

/**
 * Test for the language API
 */
describe('Language API', function(){
    /**
     * Prepare server for test language
     */
    beforeEach(function(done){
        request.post('/api/language')
            .send({
                lang: 'test_lang'
            })
            .end(done);
    });

    /**
     * Check bad request handling
     */
    it('should return 400', function(done){
        request.get('/api/language')
            .expect(400)
            .end(done);
    });

    /**
     * Testing the GET request with correct parameters
     */
    it('should return username', function(done){
        request.get('/api/language')
            .query({
                path: '/test.html'
            })
            .expect(200)
            .expect({username: "Username"})
            .end(done);
    });

    /**
     * Testing if requesting non existing translation and change language request
     */
    it('should return 400', function(done){
        request.post('/api/language')
            .send({
                lang: 'en_US'
            });
        request.get('/api/language')
            .query({
                path: '/test.html'
            })
            .expect(400)
            .end(done);
    });
});