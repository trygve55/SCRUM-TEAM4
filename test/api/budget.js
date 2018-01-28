describe('Budget API', function() {
    var typeId = -1;
    var budgetId = -1;
    before('set up test data', function(done) {
        pool.query("INSERT INTO budget_entry_type(shopping_list_id, entry_type_name) VALUES (1, 'TEST NAME')", function(err, result) {
            if(err) throw err;
            typeId = result.insertId;
            pool.query("INSERT INTO budget_entry(shopping_list_id, added_by_id, amount) VALUES (1, 1, 20)", function(err, result) {
                if(err) throw err;
                budgetId = result.insertId;
                done();
            });
        });
    });

    describe('/api/budget/ POST functions', function() {
        describe('/entryType', function() {
            it('should make a new budget entry label', function(done) {
                request.post('/api/budget/entryType').send({
                    entry_type_name: "DELETETHIS",
                    entry_type_color: 1,
                    shopping_list_id: 1
                }).expect(200).end(done);
            });
        });
        /*describe('/', function() {
            it('should add a budget entry to a shopping list', function(done) {
                request.post('/api/budget/')
                    .send({
                        "shopping_list_id": 1,
                        "amount": "20",
                        "text_note": "DELETE THIS PLEASE IT SHOULD NOT BE",
                        "budget_entry_type_id": 1,
                        "shopping_list_entry_ids": "1,2",
                        "person_ids": "1,2"
                    }).expect(200).end(done);
            });
        });*/
        describe('/pay/:budget_entry_id', function() {
            it('should add a entry to person_budget_entry ', function(done) {
                request.post('/api/budget/pay/' + budgetId).send({
                    person_ids: [1,2],
                    is_paid: true
                }).expect(500).end(done);
            });
        });
    });


    describe('/api/budget/ GET functions', function() {
        describe('/entryType', function() {
            it('should return budget entry labels for a shopping list', function(done) {
                request.get('/api/budget/entryType')
                    .query({shopping_list_id: 1})
                    .expect(200)
                    .end(done);
            });
        });
        describe('/:shopping_list_id', function() {
            it('should get the full budget for a shopping list', function(done) {
                request.get("/api/budget/1").expect(200).end(done);
            });
        });
        describe('/getDebt', function() {
            it('should get debt between logged in user and anyone else', function(done) {
                request.get("/api/budget/getDebt").expect(200).end(done);
            });
        });
        describe('/', function() {
            it('should get all budget entries, including type, for a group', function(done) {
                request.get('/api/budget?group_id=1').expect(200).end(done);
            });
        });
    });


    describe('/api/budget/ PUT functions', function() {
        describe('/entryType/:budget_entry_type_id', function() {
            it('should edit a budget entry label', function(done) {
                request.put('/api/budget/entryType/' + typeId)
                    .send({
                        budget_entry_name: "CHANGED",
                        budget_entry_color: 1
                    })
                    .expect(200)
                    .end(done);
            });
        });
        describe('/pay', function() {
            it('should set specified entries to paid in person_budget_entry', function(done) {
                request.put('/api/budget/pay').send({
                    person_id: 2,
                    budget_entry_ids: "1,2"
                }).expect(200).end(done);
            });
        });
        describe('/paySpecific', function() {
            it('should set the debt between the logged in user and the provided persons to zero', function(done) {
                request.put('/api/budget/paySpecific').send({person_ids: "2"}).expect(200).end(done);
            });
        });
    });
    describe('/api/budget/ DELETE functions', function() {
        describe('/entryType/:budget_entry_type_id', function() {
            it('should delete a budget entry label', function(done) {
                request.delete('/api/budget/entryType/' + typeId).expect(200).end(done);
            });
        });
    });
    after('delete remaining test data entered at start', function(done) {
        if(typeId != -1) {
            pool.query("DELETE FROM budget_entry WHERE budget_entry_id = ?", [budgetId], function(err, result) {
                if(err) throw err;
                pool.query("DELETE FROM budget_entry_type WHERE budget_entry_type_id = ? " +
                "OR entry_type_name = 'DELETETHIS'", [typeId], function(err, result) {
                    if(err) throw err;
                    done();
                });
            });
        } else {
            done();
        }
    });
});

/*describe('#budget.js', function() { //TODO test test
    it('should add the provided row to budget_entry', function(done) {
        pool.getConnection(function(err, connection) {
            addBdgEntTyp(connection);
            connection.query('DELETE FROM budget_entry WHERE budget_entry_type_id = 420', function(err) {
                if(err) throw err;
                request.post('/api/budget/regCost').send({
                    budget_entry_type_id: 420,
                    group_id: 1,
                    person_id: 1,
                    amount: 4990,
                    text_note: 'Macchu Picchu',
                    receipt_pic: 'notapic.jpeg'
                }).expect(200).end(function(err, res) {
                    connection.query('SELECT text_note FROM budget_entry WHERE budget_entry_type_id = 420', function(err, result) {
                        if(err) throw err;
                        chai.expect(result[0].text_note).to.equal('Macchu Picchu');
                        done();
                    });
                });
            });
        });
    });
});

function addBdgEntTyp(connection) {
    var sql ='INSERT INTO budget_entry_type (budget_entry_type_id, entry_type_color, entry_type_name, group_id) VALUES (420, "Cyan", "Carpet Weaving", 1)';
    connection.query('SELECT group_id FROM budget_entry_type WHERE budget_entry_type_id = 420', function(err, result) {
        if(err) throw err;
        if(!result[0].hasOwnProperty('group_id')) {
            connection.query(sql, function(err, result) {
                if(err) throw err;
            });
        }
    });
}*/