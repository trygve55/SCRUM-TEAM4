'use strict';

describe('General server functions', function(){
    /**
     * Check if page error is working
     */
    it('should return 404', function(done){
        request.get('/no-file.html')
            .expect(404)
            .end(done);
    });

    /**
     * Check if returns a existing page
     */
    it('should return 200', function(done){
        request.get('/login.html')
            .expect(200)
            .end(done);
    });
});