/*
describe('/', function() {
    it('should ', function(done) {
        request.METHOD('/api/tasksPrivate').expect(200).end(done);
    });
});
 */
describe('Private task API', function() {
    describe('/api/tasksPrivate/ POST functions', function() {
        describe('/', function() {
            it('should register a new shopping list on current user', function(done) {
                request.post('/api/tasks/private/').expect(200).end(done);
            });
        });
    });
    describe('/api/tasksPrivate/ GET functions', function() {
        describe('/', function() {
            it('should get all shopping lists and entries based on current user', function(done) {
                request.get('/api/tasks/private/').expect(200).end(done);
            });
        });
    });
});