//var budget = require('../../api/budget');

describe('#budget.js', function() {
    it('should add the provided row to budget_entry', function(done) {
        pool.getConnection(function(err, connection) {
            addBdgEntTyp(connection);
            connection.query('DELETE FROM budget_entry WHERE budget_entry_id = 420', function(err) {
                if(err) throw err;
                connection.release();
                console.log('Deleted potential existing entry');
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
                        chai.expect(result.text_note).to.equal('Macchu Picchu');
                    });
                    console.log('Response from POST request: ');
                    console.log(res.status);
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
}

// INSERT INTO budget_entry_type (budget_entry_type_id, entry_type_color, entry_type_name, group_id) VALUES (420, "Cyan", "Carpet Weaving", 1);