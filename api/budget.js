
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
            'FROM shopping_list_entry WHERE shopping_list_id IN ' +
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
        var data = req.body;
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
 *      text_note
 * }
 */
router.post('/', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
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
                connection.release();
                if(err)
                    return res.status(500).json({'Error' : 'connecting to database: ' } + err);
                else if (result.affectedRows != 1)
                    res.status(403).json({success: "false", error: "no access"});
                else
                    res.status(200).json({success: "true", budget_entry_id: result.insertId});
            });
    });
});

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
        /*connection.query('SELECT person_id, forename, middlename, lastname, ' +
            'budget_entry_id, amount, text_note, entry_datetime, added_by_id, ' +
            'budget_entry_type_id, entry_type_name, entry_type_color, ' +
            'currency_id, currency_short, currency_long, currency_sign, ' +
            'shopping_list.shopping_list_id, shopping_list_name, color_hex, ' +
            'shopping_list_entry_id, entry_text, purchased_by_person_id, ' +
            'added_by_person_id, cost, datetime_added, datetime_purchased ' +
            'FROM shopping_list ' +
            'LEFT JOIN budget_entry USING(shopping_list_id) ' +
            'LEFT JOIN budget_entry_type USING(budget_entry_type_id) ' +
            'LEFT JOIN person ON person.person_id = budget_entry.added_by_id ' +
            'LEFT JOIN shopping_list_entry USING (budget_entry_id) ' +
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
            'SELECT shopping_list_id FROM shopping_list_person WHERE person.person_id = ?) LIMIT 1',
            [req.params.shopping_list_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {
                connection.release();
                if(err)
                    return res.status(500).json({'Error' : 'connecting to database: ' } + err);
                else if (result.length != 1)
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
                                "entry_timedate": result[i].entry_timedate,
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
            });*/
        connection.query('SELECT * FROM budget_entry WHERE shopping_list_id = ?', [req.params.shopping_list_id], function(err, result){
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);
            res.status(200).json(result);
        });
    });
});

/**
 * Update shopping list entry
 *
 * URL: /api/shoppintList/entry/{shopping_list_entry_id}
 * method: PUT
 * data: {
 *      shopping_list_id,
 *      other sql attributes you want to change
 * }
 */
router.put('/entry/:shopping_list_entry_id', function(req, res) {
    if(!req.params.shopping_list_entry_id)
        return res.status(400).send();
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        }
        var query = putRequestSetup(req.params.shopping_list_entry_id, req, connection, "shopping_list_entry");
        connection.query(query[0], query[1], function(err, result) {
            if(err)
                return res.status(500).send();
            checkResult(err, result, connection, res);
        });
    });
});

/**
 * Remove a shopping list entry
 *
 * URL: /api/shoppingList/entry/{shopping_list_entry_id}
 * method: DELETE
 * data: {
 *
 * }
 */
router.delete('/entry/:shopping_list_entry_id', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        }
        connection.query(
            'DELETE FROM shopping_list_entry ' +
            'WHERE shopping_list_entry_id = ? AND shopping_list_id IN   ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = 1 ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person   ' +
            'LEFT JOIN group_person USING(person_id)  ' +
            'LEFT JOIN home_group USING(group_id)  ' +
            'WHERE person.person_id = 1 ' +
            'UNION  ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = 1) LIMIT 1',
            [checkRange(req.params.shopping_list_entry_id, 1, null)], function(err, result) {
                checkResult(err, result, connection, res);
            });
    });
});

/**
 * Add entry to shopping_list
 *
 * URL: /api/shoppingList/entry
 * method: POST
 * data: {
 *      shopping_list_id,
 *      entry_text,
 *      purchased_by_person_id,
 *      cost,
 *      datetime_purchased
 * }
 */
router.post('/entry', function(req, res) {
    var data = req.body, p_id = req.session.person_id;
    pool.getConnection(function(err, connection) {
        checkConnectionError(err, connection, res);
        connection.query(
            'INSERT INTO shopping_list_entry(  ' +
            'shopping_list_id,  ' +
            'entry_text,  ' +
            'added_by_person_id, ' +
            'purchased_by_person_id,  ' +
            'cost,  ' +
            'datetime_purchased)  ' +
            'SELECT 4, \'test\', 2, null, 0, null FROM shopping_list_entry WHERE shopping_list_id IN   ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = 1 ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person   ' +
            'LEFT JOIN group_person USING(person_id)  ' +
            'LEFT JOIN home_group USING(group_id)  ' +
            'WHERE person.person_id = 1 ' +
            'UNION  ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = 1) LIMIT 1',
            [
                checkRange(data.shopping_list_id, 1, null),
                data.entry_text,
                checkRange(p_id, 1, null),
                data.purchased_by_person_id,
                data.cost,
                data.datetime_purchased,
                data.shopping_list_id,
                p_id,
                p_id,
                p_id
            ], function(err, result) {
                connection.release();
                if (err)
                    return res.status(500).json({error: err});
                else if (result.insertId == 0)
                    return res.status(400).json({error: "No access/does not exist"});
                return res.status(200).json({shopping_cart_entry_id: result.insertId});
            });
    });
});

/**
 * Update shopping list info
 *
 * URL: /api/shoppingList/{shopping_list_id}
 * method: PUT
 * data: {
 *      data to change sql attributes
 * }
 */
router.put('/:shopping_list_id', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        }
        var query = putRequestSetup(req.params.shopping_list_id , req, connection, "shopping_list");
        connection.query(query[0], query[1], function(err, result) {
                checkResult(err, result, connection, res);
            }
        );
    });
});

// Help methods:

/**
 * Make the neccesary setup for a put request.
 */
function putRequestSetup(id, req, connection, tableName) {
    var parameters = [], request = 'UPDATE ' + tableName + ' SET ', first = true;
    for (var k in req.body) {
        if (k !== req.body.shopping_list_id && k !== req.body.shopping_list_entry_id) {
            (!first) ? request += ', ' :  first = false;
            request += k + ' = ?';
            parameters.push(req.body[k]);
        }
    }
    request += ' WHERE ' + tableName + '_id = ' + id +
        ' AND shopping_list_id IN  ' +
        '(SELECT shopping_list_id FROM person WHERE person_id = ?  ' +
        'UNION  ' +
        'SELECT home_group.shopping_list_id FROM person  ' +
        'LEFT JOIN group_person USING(person_id) ' +
        'LEFT JOIN home_group USING(group_id) ' +
        'WHERE person.person_id = ? ' +
        'UNION ' +
        'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ? AND invite_accepted = 1) LIMIT 1';
    parameters.push(req.session.person_id);
    parameters.push(req.session.person_id);
    parameters.push(req.session.person_id);
    return [request, parameters];
}

function removeDuplicateUsingFilter(arr){
    var added_ids = [], unique_array = arr.filter(function(elem, index, self) {
        if (!elem.shopping_list_entry_id && elem.shopping_list_id) {
            if (added_ids.indexOf(elem.shopping_list_id) == -1) {
                added_ids.push(elem.shopping_list_id);
                return true;
            } else { return false; }
        } else if (elem.shopping_list_entry_id) {
            if (added_ids.indexOf(elem.shopping_list_entry_id) == -1) {
                added_ids.push(elem.shopping_list_entry_id);
                return true;
            } else { return false; }
        }
        return index == self.indexOf(elem);
    });
    return unique_array;
}

function budgetEntryExistsInArray(budget_entry_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].budget_entry_id == budget_entry_id) return i;
    }
    return -1;
}

function shoppingListEntryExistsInArray(budget_entry_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].budget_entry_id == budget_entry_id) return i;
    }
    return -1;
}