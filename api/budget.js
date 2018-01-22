
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

    for (var i = 0; i < req.body.person_ids.length;i++) {
        if (i != 0) query += ",";
        queryValues.push(req.body.person_ids[i]);
        queryValues.push(result.insertId);
        query += "(?,?)";
    }

    console.log(result);

    connection.query(
        'INSERT INTO person_budget_entry (person_id, budget_entry_id) VALUES ' + query +';',
        queryValues,
        function (err, result2) {
            console.log('INSERT INTO person_budget_entry (person_id, budget_entry_id) VALUES ' + query +';');
            console.log(queryValues);
            console.log(result2);

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
        if (err) {
            console.log("test0");
            return res.status(500).json({'Error': 'connecting to database: '} + err);
        }
        connection.query('SELECT ' +
            'person.person_id, person.forename, person.middlename, person.lastname, ' +
            'budget_entry_id, amount, text_note, entry_datetime, added_by_id, ' +
            'budget_entry_type_id, entry_type_name, entry_type_color, ' +
            'currency_id, currency_short, currency_long, currency_sign, ' +
            'shopping_list.shopping_list_id, shopping_list_name, color_hex, ' +
            'shopping_list_entry_id, entry_text, purchased_by_person_id, ' +
            'added_by_person_id, cost, datetime_added, datetime_purchased, ' +
            'person_budget_entry.person_id AS paid_person_id, datetime_paid, ' +
            'paid_person.forename AS paid_person_forename, ' +
            'paid_person.middlename AS paid_person_middlename, ' +
            'paid_person.lastname AS paid_person_lastname ' +
            'FROM shopping_list ' +
            'LEFT JOIN budget_entry USING(shopping_list_id) ' +
            'LEFT JOIN shopping_list_entry USING (budget_entry_id) ' +
            'LEFT JOIN budget_entry_type USING(budget_entry_type_id) ' +
            'LEFT JOIN person ON person.person_id = budget_entry.added_by_id ' +
            'LEFT JOIN currency USING(currency_id) ' +
            'LEFT JOIN person_budget_entry USING (budget_entry_id) ' +
            'LEFT JOIN person AS paid_person ON person_budget_entry.person_id = paid_person.person_id ' +
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
                if (err) {
                    console.log("test1");
                    return res.status(500).json({'Error': 'connecting to database: '} + err);
                }
                else if (result.length == 0)
                    res.status(403).json({success: "false", error: "no access"});
                else {
                    var budget_entries = [], debt = [];
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

                        if (result[i].shopping_list_entry_id && shoppingListEntryExistsInArray(result[i].shopping_list_entry_id, budget_entries[current_budget_entry_id].budget_shopping_list_entries) === -1) budget_entries[current_budget_entry_id].budget_shopping_list_entries.push({
                            "shopping_list_entry_id": result[i].shopping_list_entry_id,
                            "entry_text": result[i].entry_text,
                            "added_by_person_id": result[i].added_by_person_id,
                            "purchased_by_person_id": result[i].purchased_by_person_id,
                            "cost": result[i].cost,
                            "datetime_added": result[i].datetime_added,
                            "datetime_purchased": result[i].datetime_purchased
                        });

                        if (result[i].paid_person_id && payPersonExistsInArray(result[i].paid_person_id, budget_entries[current_budget_entry_id].persons_to_pay) === -1) budget_entries[current_budget_entry_id].persons_to_pay.push({
                            "person_id": result[i].paid_person_id,
                            "datetime_paid": result[i].datetime_paid,
                            "forename": result[i].paid_person_forename,
                            "middlename": result[i].paid_person_middlename,
                            "lastname": result[i].paid_person_lastname
                        });
                    }

                    for (var i = 0;i < budget_entries.length;i++) {
                        for (var j = 0; j < budget_entries[i].persons_to_pay.length;j++) {
                            budget_entries[i].persons_to_pay[j].amount_to_pay = budget_entries[i].amount / budget_entries[i].persons_to_pay.length;
                        }
                    }
					
					var persons_to_get_paid = [];
					
					for (var i = 0;i < budget_entries.length;i++) {
						var paid_to_person_index = payPersonExistsInArray(budget_entries[i].added_by.person_id, persons_to_get_paid);
						if (paid_to_person_index === -1) {
						    var person = {
                                "person_id": budget_entries[i].added_by.person_id,
                                "forename": budget_entries[i].added_by.forename,
                                "middlename": budget_entries[i].added_by.middlename,
                                "lastname": budget_entries[i].added_by.lastname
                            };
							persons_to_get_paid.push({
								"person": person,
								"persons_to_pay": []
							});
							paid_to_person_index = persons_to_get_paid.length - 1;
						}
                        for (var j = 0; j < budget_entries[i].persons_to_pay.length;j++) {
						    if (budget_entries[i].persons_to_pay[j].person_id !== persons_to_get_paid[paid_to_person_index].person_id) {
                                if (budget_entries[i].persons_to_pay[j].datetime_paid === null) {
                                    var pay_from_person_index = payPersonExistsInArray(budget_entries[i].persons_to_pay[j].person_id, persons_to_get_paid[paid_to_person_index].persons_to_pay);
                                    if (pay_from_person_index === -1) {
                                        var person = {
                                            "person_id": budget_entries[i].persons_to_pay[j].person_id,
                                            "forename": budget_entries[i].persons_to_pay[j].forename,
                                            "middlename": budget_entries[i].persons_to_pay[j].middlename,
                                            "lastname": budget_entries[i].persons_to_pay[j].lastname
                                        };
                                        persons_to_get_paid[paid_to_person_index].persons_to_pay.push({
                                            "person": person,
                                            "amount_to_pay": budget_entries[i].persons_to_pay[j].amount_to_pay
                                        });
                                        pay_from_person_index = persons_to_get_paid[paid_to_person_index].persons_to_pay.length - 1;
                                    } else {
                                        persons_to_get_paid[paid_to_person_index].persons_to_pay[pay_from_person_index].amount_to_pay += budget_entries[i].persons_to_pay[j].amount_to_pay;
                                    }
                                }
                            }
                        }
                    }

                    for (var i = 0;i < persons_to_get_paid.length;i++) {
					    for (var j = 0;j < persons_to_get_paid.length;j++) {
					        if (persons_to_get_paid[i].person_id !== persons_to_get_paid[j].person_id) {
                                for (var k = 0;k < persons_to_get_paid[j].persons_to_pay.length;k++) {
                                    if (persons_to_get_paid[j].persons_to_pay[k].person_id === persons_to_get_paid[i].person_id) {
                                        for (var l = 0; l < persons_to_get_paid[i].persons_to_pay.length;l++) {
                                            if (persons_to_get_paid[i].persons_to_pay[l].person_id === persons_to_get_paid[j].person_id) {
                                                if (persons_to_get_paid[i].persons_to_pay[l].amount_to_pay === persons_to_get_paid[j].persons_to_pay[k].amount_to_pay) {
                                                    persons_to_get_paid[i].persons_to_pay.splice(l,1);
                                                    persons_to_get_paid[j].persons_to_pay.splice(k,1);
                                                } else if (persons_to_get_paid[i].persons_to_pay[l].amount_to_pay < persons_to_get_paid[j].persons_to_pay[k].amount_to_pay) {
                                                    persons_to_get_paid[j].persons_to_pay[k].amount_to_pay -= persons_to_get_paid[i].persons_to_pay[l].amount_to_pay;
                                                    persons_to_get_paid[i].persons_to_pay.splice(l,1);
                                                } else {
                                                    persons_to_get_paid[i].persons_to_pay[l].amount_to_pay -= persons_to_get_paid[j].persons_to_pay[k].amount_to_pay;
                                                    persons_to_get_paid[j].persons_to_pay.splice(k,1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
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
                        budget_entries: budget_entries,
                        persons_to_get_paid: persons_to_get_paid
                    });
                }
            });
    });
});


/**
 * Adds a to pay for a budget entry
 *
 * URL: /api/budget/{budget_entry_id}
 * method: POST
 * data: {
 *      person_ids[],
 *      is_paid
 * }
 */
router.post('/pay/:budget_entry_id', function(req, res) {

    var query = "", queryValues = [], payers = req.body.person_ids, budget_entry_id = req.params.budget_entry_id;
    if (payers.length === 0) return res.status(400).json({error: "no payers array"})
    for (var i = 0; i < payers.length;i++) {
        if (i !== 0) query += ", ";
        query += "( ?, ? " + ((req.body.is_paid) ? ',CURRENT_TIMESTAMP)': ',NULL )');
        queryValues[i*2] = budget_entry_id;
        queryValues[i*2+1] = payers[i];
    }

    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        connection.query('INSERT INTO person_budget_entry(budget_entry_id, person_id, datetime_paid' + ') VALUES ' + query, queryValues, function(err, result) {
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);
            else if (result.affectedRows === 0)
                res.status(403).json({success: "false", error: "no access"});
            else
                res.status(200).send();
        });
    });
});

/**
 * Adds a to pay for a budget entry
 *
 * URL: /api/budget/{budget_entry_id}
 * method: PUT
 * data: {
 *      person_id,
 *      is_paid
 * }
 */
router.put('/pay/:budget_entry_id', function(req, res) {

    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        if(req.body.is_paid) connection.query('UPDATE person_budget_entry SET datetime_paid = CURRENT_TIMESTAMP WHERE budget_entry_id = ? AND person_id = ?;',
            [req.params.budget_entry_id, req.body.person_id], function(err, result) {
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);
            else if (result.affectedRows == 0)
                res.status(403).json({success: "false", error: "no access"});
            else
                res.status(200).json({success: "true"});
        }); else connection.query('UPDATE person_budget_entry SET datetime_paid = NULL WHERE budget_entry_id = ? AND person_id = ?;',
            [req.params.budget_entry_id, req.body.person_id], function(err, result) {
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);
            else if (result.affectedRows == 0)
                res.status(403).json({success: "false", error: "no access"});
            else
                res.status(200).send();
        });
    });
});

function budgetEntryExistsInArray(budget_entry_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].budget_entry_id == budget_entry_id) return i;
    }
    return -1;
}

function shoppingListEntryExistsInArray(shopping_list_entry_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].shopping_list_entry_id == shopping_list_entry_id) return i;
    }
    return -1;
}

function payPersonExistsInArray(person_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].person_id == person_id) return i;
    }
    return -1;
}

function paidPersonExistsInArray(person_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].person_id == person_id) return i;
    }
    return -1;
}
