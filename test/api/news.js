/*
describe('/', function() {
    it('should ', function(done) {
        request.METHOD('/api/news').expect(200).end(done);
    });
});
 */
describe('News API', function() {
    describe('/api/news/ POST functions', function() {
        describe('/', function() {
            it('should ', function(done) {
                request.post('/api/news/').send({
                    group_id: 1,
                    post_text: "TESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST",
                }).expect(200).end(done);
            });
        });
    });
});