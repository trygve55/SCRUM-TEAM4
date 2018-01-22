/**
 * Prepare server for test language
 */

before("Create session (log in)", function(done){
    request.post('/api/auth')
        .send({
            username: 'testnavn',
            password: 'test'
        })
        .expect(200)
        .end(function(err, res) {
            if (err)
                return done(err);
            Cookies = res.headers['set-cookie'].pop().split(';')[0];
            return done();
        });
});

after(function(){
    pool.end();
});

/**
 *
 *  Method for testing connections
 *  method reboots login after fail.
 *
 */
/*afterEach(function(done) {
    if(pool._allConnections.length > 1) {
        console.log('Method does not close connection\n');
        pool.end();
        done();
    } else {
        console.log('Connections OK\n');
        done();
    }
});*/

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
    it('should return 200 and Close', function(done){
        request.post('/api/language')
            .send({
                lang: 'en_US'
            })
            .end(function(err){
                if(err)
                    return done(err);
                request.get('/api/language')
                    .query({
                        path: '/tasks.html'
                    })
                    .expect(200)
                    .end(function(err, res){
                        chai.expect(res.body['tasks-cancel']).to.equal("Close");
                        done();
                    });
            });
    });

    /**
     * Testing if requesting non existing translation and change language request
     */
    it('should return 400', function(done){
        request.post('/api/language')
            .send({
                lang: 'en_US'
            })
            .end(function(err){
                if(err)
                    return done(err);
                request.get('/api/language')
                    .query({
                        path: '/test.html'
                    })
                    .expect(400)
                    .end(done);
            });
    });
});