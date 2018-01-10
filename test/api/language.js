'use strict';

/**
 * Test for the language API
 */
describe('Language API', function(){
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
                path: '/test.html',
                lang: 'test_lang'
            })
            .expect(200)
            .expect({username: "Username"})
            .end(done);
    });

    /**
     * Testing if requesting non existing translation
     */
    it('should return 400', function(done){
        request.get('/api/language')
            .query({
                path: '/test.html',
                lang: 'en_US'
            })
            .expect(400)
            .end(done);
    });
});