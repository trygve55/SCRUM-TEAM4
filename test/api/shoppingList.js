/*

describe('/', function() {
    it('should ', function(done) {
        request.METHOD('/api/shoppingList').expect(200).end(done);
    });
});

 */

describe('Shopping List API', function() {
    describe('/api/shoppingList/ GET', function() {
        describe('/', function() {
            it('should return the shopping list the current user has access to', function(done) {
                request.get('/api/shoppingList/').expect(200).end(done);
            });
        });
        describe('/:shopping_list_id/users', function() {
            it('should get person info', function(done) {
                request.get('/api/shoppingList/4/users').expect(200).end(done);
            });
        });
        describe('/:shopping_list_id', function() {
            it('should get all info about one shopping list', function(done) {
                request.get('/api/shoppingList/4').expect(200).end(done);
            });
        });
        /*describe('/statistic/:entry_type_name', function() {
            it('should get all entries with a label in a time interval for a group', function(done) {
                request.get('/api/shoppingList/statistic/').expect(200).end(done);
            });
        });*/

    });
    describe('/api/shoppingList/ POST', function() {
        describe('/', function() {
            it('should generate a shopping list for the current user', function(done) {
                request.post('/api/shoppingList/').send({
                    currency_id: 100,
                    shopping_list_name: "DELETE"
                }).expect(200).end(done);
            });
        });
        describe('/invite', function() {
            it('should invite a person to a shopping list', function(done) {
                request.post('/api/shoppingList/invite').send({
                    shopping_list_id: 4,
                    person_id: 3
                }).expect(200).end(done);
            });
            after('delete test data', function(done) {
                pool.query('DELETE FROM shopping_list_person WHERE shopping_list_id = 4 AND person_id = 3', function(err, result) {
                    if(err) throw err;
                    done();
                });
            });
        });
        describe('/entry', function() {
            it('should add an entry to shopping list', function(done) {
                request.post('/api/shoppingList/entry').send({
                    shopping_list_id: 4,
                    entry_text: "TESTTEST",
                    purchased_by_person_id: 1,
                    cost: 20,
                }).expect(200).end(done);
            });
        });
    });
    describe('/api/shoppingList/ PUT', function() {
        describe('/entry/:shopping_list_entry_id', function() {
            it('should update a shopping list entry', function(done) {
                request.put('/api/shoppingList/entry/1').send({
                    shopping_list_id: 1,
                    entry_text: "Test change"
                }).expect(200).end(done);
            });
        });
        describe('/info/:shopping_list_id', function() {
            it('should update shopping list person info', function(done) {
                request.put('/api/shoppingList/info/4').send({
                    is_hidden: "false"
                }).expect(200).end(done);
            });
        });
        describe('/:shopping_list_id', function() {
            it('should update shopping list info', function(done) {
                request.put('/api/shoppingList/4').send({
                    currency_id: 123
                }).expect(200).end(done);
            });
        });
    });
    /*describe('/api/shoppingList/ DELETE', function() {
        describe('/', function() {
            it('should ', function(done) {
                //request.METHOD('/api/shoppingList').expect(200).end(done);
            });
        });
    });*/
});