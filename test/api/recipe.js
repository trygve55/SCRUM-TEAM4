/*
describe('/', function() {
    it('should ', function(done) {
        request.METHOD('/api/recipe').expect(200).end(done);
    });
});
*/

describe('Recipe API', function() {
    describe('/api/recipe/ GET functions', function() {
        describe('/me', function() {
            it('should get all the recipe the current user has planned', function(done) {
                request.get('/api/recipe/me').expect(200).end(done);
            });
        });
        describe('/:group_id', function() {
            it('should get all the recipes a group has planned', function(done) {
                request.get('/api/recipe/1').expect(200).end(done);
            });
        });
        describe('/', function() {
            it('should get all recipes in the database', function(done) {
                request.get('/api/recipe/').expect(200).end(done);
            });
        });
    });/*
    describe('/api/recipe/ METHOD functions', function() {

    });
    describe('/api/recipe/ METHOD functions', function() {

    });
    describe('/api/recipe/ METHOD functions', function() {

    });*/
});