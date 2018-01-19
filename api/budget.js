
var router = require('express').Router();

module.exports = router;

/**
 * Adds a new budget entry label
 *
 * URL: /api/budget/entryType
 * method: POST
 * data: {
 *      budget_entry_name,
 *      budget_entry_color
 * }
 */
router.post('/entryType', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        var data = req.body;
        connection.query('INSERT INTO budget_entry_type (entry_type_name, entry_type_color, shopping_list_id) SELECT ?, ?, ? ' +
            'FROM shopping_list WHERE shopping_list_id IN ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = ? ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person   ' +
            'LEFT JOIN group_person USING(person_id)  ' +
            'LEFT JOIN home_group USING(group_id)  ' +
            'WHERE person.person_id = ? ' +
            'UNION  ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?) LIMIT 1',
            [data.entry_type_name, data.entry_type_color, data.shopping_list_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {

            connection.release();
            if(err) return res.status(500).json({'Error' : err});
            if (result.rowsAffected == 0) return res.status(400).json({success: "false", error: "No access or does not exist"});
            res.status(200).json({success: "true", budget_entry_type_id: result.insertId});
        });
    });
});

/**
 * Returns a budget entry label
 *
 * URL: /api/budget/entryType
 * method: GET
 * data: {
 *      shopping_list_id,
 * }
 */
router.get('/entryType', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        var data = req.body;
        connection.query('SELECT * FROM budget_entry_type ' +
            'WHERE shopping_list_id = ? AND shopping_list_id IN ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = ? ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person   ' +
            'LEFT JOIN group_person USING(person_id)  ' +
            'LEFT JOIN home_group USING(group_id)  ' +
            'WHERE person.person_id = ? ' +
            'UNION  ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?) LIMIT 1',
            [req.query.shopping_list_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {

                connection.release();
                if(err) return res.status(500).json({'Error' : err});
                var budget_entry_types = []
                for (var i = 0; i < result.length; i++) {
                    budget_entry_types.push({
                        budget_entry_type_id: result[i].budget_entry_type_id,
                        entry_type_name: result[i].entry_type_name,
                        entry_type_color: result[i].entry_type_color
                    });
                }

                res.status(200).json({budget_entry_types: budget_entry_types});
            });
    });
});

/**
 * Edits budget entry label
 *
 * URL: /api/budget/entryType/{budget_entry_type_id}
 * method: PUT
 * data: {
 *      budget_entry_name,
 *      budget_entry_color
 * }
 */
router.put('/entryType/:budget_entry_type_id', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        var data = req.body;
        connection.query('UPDATE budget_entry_type ' +
            'SET ' +
            'entry_type_name = ?, ' +
            'entry_type_color = ? ' +
            'WHERE ' +
            'budget_entry_type_id = ? AND ' +
            'shopping_list_id IN ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = ? ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person   ' +
            'LEFT JOIN group_person USING(person_id)  ' +
            'LEFT JOIN home_group USING(group_id)  ' +
            'WHERE person.person_id = ? ' +
            'UNION  ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?) LIMIT 1',
            [data.entry_type_name, data.entry_type_color, req.params.budget_entry_type_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {

                connection.release();
                if (err) return res.status(500).json({'Error' : err});
                if (result.rowsAffected == 0) return res.status(400).json({success: "false", error: "No access or does not exist"});
                res.status(200).json({success: "true"});
            });
    });
});

/**
 * Removes a budget entry label
 *
 * URL: /api/budget/entryType/{budget_entry_type_id}
 * method: DELETE
 */
router.delete('/entryType/:budget_entry_type_id', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        connection.query('DELETE FROM budget_entry_type ' +
            'WHERE ' +
            'budget_entry_type_id = ? AND ' +
            'shopping_list_id IN ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = 1 ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person   ' +
            'LEFT JOIN group_person USING(person_id)  ' +
            'LEFT JOIN home_group USING(group_id)  ' +
            'WHERE person.person_id = 1 ' +
            'UNION  ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = 1) LIMIT 1',
            [req.params.budget_entry_type_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {

                connection.release();
                if (err) return res.status(500).json({'Error' : err});
                if (result.rowsAffected == 0) return res.status(400).json({success: "false", error: "No access or does not exist"});
                res.status(200).json({success: "true"});
            });
    });
});

/**
 * Adds a budget entry to shopping list
 *
 * URL: /api/budget
 * method: POST
 * data: {
 *      shopping_list_id,
 *      amount,
 *      text_note,
 *      budget_entry_type_id,
 *      shopping_list_entry_ids[],
 *      person_ids[]
 * }
 */
router.post('/', function(req, res) {
    console.log();

    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        }

        connection.beginTransaction(function (err) {
            if(err) {
                connection.release();
                return res.status(500).json({'Error': 'connecting to database: '} + err);
            }
            connection.query('INSERT INTO budget_entry(shopping_list_id, amount, text_note, budget_entry_type_id, added_by_id) ' +
                'SELECT ?,?,?,?,? FROM shopping_list ' +
                'WHERE shopping_list_id IN ' +
                '(SELECT shopping_list_id FROM person WHERE person_id = ? ' +
                'UNION  ' +
                'SELECT home_group.shopping_list_id FROM person   ' +
                'LEFT JOIN group_person USING(person_id)  ' +
                'LEFT JOIN home_group USING(group_id)  ' +
                'WHERE person.person_id = ? ' +
                'UNION  ' +
                'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?) LIMIT 1',
                [req.body.shopping_list_id, req.body.amount, req.body.text_note, req.body.budget_entry_type_id, req.session.person_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {
                    if(err)
                        return connection.rollback(function () {
                            connection.release();
                            res.status(500).json({'Error' : 'connecting to database: ' } + err);
                        });
                    else if (result.affectedRows != 1)
                        return connection.rollback(function () {
                            connection.release();
                            res.status(500).json({'Error' : 'connecting to database: ' } + err);
                        });
                    console.log("test2");
                    if (req.body.shopping_list_entry_ids && req.body.shopping_list_entry_ids.length > 0) {
                        addShoppingListEntryToBudgetEntry(req, res, connection, result);
                    } else if (req.body.person_ids && req.body.person_ids.length > 0) {
                        addPersonBudgetEntry(req, res, connection, result);
                    } else {
                        answerPost(req, res, connection, result);
                    }
                });
        });


    });
});

function answerPost(req, res, connection, result) {
    console.error("annswerPost");

    connection.commit(function (err) {
        if (err) {
            connection.rollback(function () {
                connection.release();
                return res.status(500).json({error: err});
            });
            return res.status(500).json({error: err});
        }
        connection.release();
        res.status(200).json({budget_entry_id: result.insertId})
    });
}

function addPersonBudgetEntry(req, res, connection, result){
    console.log("adding persons_ids");
    var queryValues = [], query = "";
    queryValues.push(result.insertId);

    for (var i = 0; i < req.body.person_ids.length;i++) {
        if (i != 0) query += ",";
        queryValues.push(req.body.person_ids[i]);
        queryValues.push(result.insertId);
        query += "(?,?)";
    }

    connection.query(
        'INSERT INTO person_budget_entry (person_id, budget_entry_id) VALUES ' + query +';',
        queryValues,
        function (err, result2) {
            if (err)
                return connection.rollback(function () {
                    connection.release();
                    res.status(500).json({'Error': 'connecting to database: '} + err);
                });
            answerPost(req, res, connection, result);
            });
}

function addShoppingListEntryToBudgetEntry(req, res, connection, result) {
    console.log("adding shopping_list_entry_ids");
    var queryValues = [], query = "";
    queryValues.push(result.insertId);
    queryValues.push(req.session.person_id);

    for (var i = 0; i < req.body.shopping_list_entry_ids.length;i++) {
        if (i != 0) query += ",";
        queryValues.push(req.body.shopping_list_entry_ids[i]);
        query += "?";
    }

    connection.query(
        'UPDATE shopping_list_entry SET budget_entry_id = ?, purchased_by_person_id = ?, datetime_purchased = CURRENT_TIMESTAMP WHERE shopping_list_entry_id IN (' + query +');',
        queryValues,
        function (err, result2) {
            if(err)
                return connection.rollback(function () {
                    connection.release();
                    res.status(500).json({'Error' : 'connecting to database: ' } + err);
                });

            if (req.body.person_ids && req.body.person_ids.length > 0) {
                addPersonBudgetEntry(req, res, connection, result);
            } else {
                answerPost(req, res, connection, result);
            }
        });
}

/**
 * Get full budget for a shopping list
 *
 * URL: /api/budget/{shopping_list_id}
 * method: GET
 */
router.get('/:shopping_list_id', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        connection.query('SELECT ' +
            'person.person_id, forename, middlename, lastname, ' +
            'budget_entry_id, amount, text_note, entry_datetime, added_by_id, ' +
            'budget_entry_type_id, entry_type_name, entry_type_color, ' +
            'currency_id, currency_short, currency_long, currency_sign, ' +
            'shopping_list.shopping_list_id, shopping_list_name, color_hex, ' +
            'shopping_list_entry_id, entry_text, purchased_by_person_id, ' +
            'added_by_person_id, cost, datetime_added, datetime_purchased ' +
            'person_budget_entry.person_id, is_paid' +
            'FROM shopping_list ' +
            'LEFT JOIN budget_entry USING(shopping_list_id) ' +
            'LEFT JOIN shopping_list_entry USING (budget_entry_id) ' +
            'LEFT JOIN budget_entry_type USING(budget_entry_type_id) ' +
            'LEFT JOIN person ON person.person_id = budget_entry.added_by_id ' +
            'LEFT JOIN currency USING(currency_id) ' +
            'LEFT JOIN person_budget_entry USING (budget_entry_id) ' +
            'WHERE shopping_list.shopping_list_id = ? AND shopping_list.shopping_list_id IN ' +
            '(SELECT shopping_list_id FROM person WHERE person.person_id = ? ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person   ' +
            'LEFT JOIN group_person USING(person_id)  ' +
            'LEFT JOIN home_group USING(group_id)  ' +
            'WHERE person.person_id = ? ' +
            'UNION ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person.person_id = ?) ',
            [req.params.shopping_list_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {
                connection.release();
                if(err)
                    return res.status(500).json({'Error' : 'connecting to database: ' } + err);
                else if (result.length == 0)
                    res.status(403).json({success: "false", error: "no access"});
                else {
                    var budget_entries = [];
                    for (var i = 0; i < result.length;i++) {
                        var current_budget_entry_id = budgetEntryExistsInArray(result[i].budget_entry_id, budget_entries);
                        if (current_budget_entry_id == -1) {
                            budget_entries.push({
                                "budget_entry_id": result[i].budget_entry_id,
                                "amount": result[i].amount,
                                "text_note": result[i].text_note,
                                "entry_datetime": result[i].entry_datetime,
                                "added_by": {
                                    "person_id": result[i].added_by_id,
                                    "forename": result[i].forename,
                                    "middlename": result[i].middlename,
                                    "lastname": result[i].lastname
                                },
                                "budget_entry_type": {
                                    "budget_entry_type_id": result[i].budget_entry_type_id,
                                    "budget_entry_type_name": result[i].entry_type_name,
                                    "budget_entry_type_color": result[i].entry_type_color,
                                },
                                "persons_to_pay": [],
                                "budget_shopping_list_entries": []
                            });
                            current_budget_entry_id = budget_entries.length - 1;
                        }

                        if (result[i].shopping_list_entry_id) budget_entries[current_budget_entry_id].budget_shopping_list_entries.push({
                            "shopping_list_entry_id": result[i].shopping_list_entry_id,
                            "entry_text": result[i].entry_text,
                            "added_by_person_id": result[i].added_by_person_id,
                            "purchased_by_person_id": result[i].purchased_by_person_id,
                            "cost": result[i].cost,
                            "datetime_added": result[i].datetime_added,
                            "datetime_purchased": result[i].datetime_purchased
                        });

                        if (result[i].is_paid) budget_entries[current_budget_entry_id].persons_to_pay.push({
                            "shopping_list_entry_id": result[i].shopping_list_entry_id,
                            "entry_text": result[i].entry_text,
                            "added_by_person_id": result[i].added_by_person_id,
                            "purchased_by_person_id": result[i].purchased_by_person_id,
                            "cost": result[i].cost,
                            "datetime_added": result[i].datetime_added,
                            "datetime_purchased": result[i].datetime_purchased
                        });
                    }

                    res.status(200).json({
                        shopping_list_id: req.params.shopping_list_id,
                        shopping_list_name:  result[0].shopping_list_name,
                        color_hex:  result[0].color_hex,
                        currency: {
                            currency_id: result[0].currency_id,
                            currency_short: result[0].currency_short,
                            currency_long: result[0].currency_long,
                            currency_sign: result[0].currency_sign
                        },
                        budget_entries: budget_entries
                    });
                }
            });
    });
});

router.post('/pay/:budget_entry_id', function(req, res) {

    var query = "", queryValues = [], payers = req.body.payers, budget_entry_id = req.params.budget_entry_id;
    if (payers.length == 0) return res.status(400).json({error: "no payers array"})
    for (var i = 0; i < payers.length;i++) {
        if (i != 0) queryValues += ", ";
        query += "( ?, ? )";
        queryValues[i*2] = budget_entry_id;
        queryValues[i*2+1] = payers[i];
    }

    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        connection.query('INSERT INTO person_budget_entry(budget_entry_id, person_id) VALUES ' + query, queryValues, function(err, result) {
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);
            else if (result.affectedRows == 0)
                res.status(403).json({success: "false", error: "no access"});
            else
                res.status(200).json({success: "true", budget_entry_id: result.insertId});
        });
    });
});

router.put('/pay/:budget_entry_id', function(req, res) {

    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        connection.query('UPDATE person budget_entry SET is_paid = ?  WHERE budget_entry_id = ? AND person_id = ?);',
            [req.body.is_paid, req.params.budget_entry_id, req.body.person_id], function(err, result) {
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);
            else if (result.affectedRows == 0)
                res.status(403).json({success: "false", error: "no access"});
            else
                res.status(200).json({success: "true", budget_entry_id: result.insertId});
        });
    });
});

function budgetEntryExistsInArray(budget_entry_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].budget_entry_id == budget_entry_id) return i;
    }
    return -1;
}
