/**
 * Prepare server for test language
 */
before(function(done){
    request.post('/api/language')
        .send({
            lang: 'test_lang'
        })
        .expect(200)
        .end(function(err, res) {
            if (err)
                return done(err);
            Cookies = res.headers['set-cookie'].pop().split(';')[0];
            console.log(Cookies);
            return done();
        });
});

after(function(){
    pool.end();
});

/**
 * Test for the language API
 */
describe('Language API', function(){
    var Cookies;
    /**
     * Prepare server for test language
     */
    before(function(done){
        request.post('/api/language')
            .send({
                lang: 'test_lang'
            })
            .expect(200)
            .end(function(err, res){
                if(err)
                    return done(err);
                Cookies = res.headers['set-cookie'].pop().split(';')[0];
                return done();
            });
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
        var req = request.get('/api/language').query({
            path: '/test.html'
        });
        req.cookies = Cookies;
        req.expect(200)
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