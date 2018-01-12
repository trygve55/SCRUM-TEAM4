var router = require('express').Router();

module.exports = router;

/*
POST request to register a new cost.
Body: {
    budget_entry_type_id,
    group_id: INTEGER,
    added_by_id: INTEGER,
    amount: INTEGER,
    text_note: NVARCHAR(30),
    receipt_pic: BLOB
}
 */

router.post('/regCost', function(req,res) {
    pool.getConnection(function(err, connection)  {
        if(err) {
            res.status(500);
            res.json({'error': 'error connecting to database: ' + err});
            return;
        }
        if(false) { //TODO add check for access privilege (check that provided person_id matches authentication key or whatever is used)
            res.status(403);
            return;
        }
        var sql = 'INSERT INTO budget_entry (budget_entry_type_id, group_id, added_by_id, amount, text_note, ' +
            'receipt_pic) VALUES (?,?,?,?,?,?)';
        var values;
        var b = req.body;
        if(!b.hasOwnProperty('text_note')) b.text_note = null;
        if(!b.hasOwnProperty('receipt_pic')) b.receipt_pic = null;
        connection.query(sql, [b.budget_entry_type_id, b.group_id, b.added_by_id, b.amount, b.text_note, b.receipt_pic], function (err) {
            if(err) {
                res.status(400);
                res.json({'error': 'error in query : ' + err});
                return;
            }
            connection.query('SELECT LAST_INSERT_ID()', function(err, result) {
                if(err) {
                    res.status(500);
                    res.json({'error': 'error in database query'});
                    return;
                }
                res.status(200);
                res.json({'budget_entry_type_id': result});
            });
        });
    });
});