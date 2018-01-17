
var router = require('express').Router();

module.exports = router;
/**
 * Generate a new shopping list for the current user
 *
 * URL: /api/shoppingList
 * method: POST
 * data: {
 *      currency_id,
 *      shopping_list_name
 * }
 */
router.post('/', function(req, res) {
    if(!req.body.currency_id || !req.body.shopping_list_name)
        return res.status(400).send();
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        }
        var data = req.body;
        connection.beginTransaction(function (err) {
            if(err)
                return connection.rollback(function () {
                    connection.release();
                    res.status(500).json({'Error' : err});
                });
            connection.query('INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES (?,?)',
                [data.shopping_list_name, checkRange(data.currency_id, 1, null)], function(err, result) {
                    if(err)
                        return connection.rollback(function () {
                            connection.release();
                            res.status(500).json({'Error' : err});
                        });
                    connection.query('INSERT INTO shopping_list_person(shopping_list_id, person_id, invite_accepted) VALUES (?,?,?);',
                        [result.insertId, req.session.person_id, true], function (err) {
                            if (err)
                                return connection.rollback(function () {
                                    connection.release();
                                    res.status(500).json({'Error': err});
                                });
                            connection.commit(function (err) {
                                if (err)
                                    return connection.rollback(function () {
                                        connection.release();
                                        res.status(500).json({'Error': err});
                                    });
                                connection.release();
                                res.status(200).json({success: "true", shopping_list_id: result.insertId});
                            });
                        });
                });
        });
    });
});

/**
 * Invite person to shopping list
 *
 * URL: /api/shoppingList/invite
 * method: POST
 * data: {
 *      shopping_list_id,
 *      person_id - person to invite
 * }
 */
router.post('/invite', function(req, res) {
    if(!req.body.shopping_list_id || !req.body.person_id)
        return res.status(400).send();
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        connection.query('INSERT INTO shopping_list_person(shopping_list_id, person_id) SELECT ?,? FROM shopping_list_person ' +
            'WHERE EXISTS (SELECT person_id FROM shopping_list_person WHERE person_id = ? AND shopping_list_id = ?) LIMIT 1;',
            [req.body.shopping_list_id, req.body.person_id, req.session.person_id, req.body.shopping_list_id], function(err, result) {
                connection.release();
                if(err)
                    return res.status(500).json({'Error' : 'connecting to database: ' } + err);
                else if (result.affectedRows != 1)
                    res.status(403).json({success: "false", error: "no access"});
                else
                    res.status(200).json({success: "true"});
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
            connection.release();
            if (err) return res.status(500).json({error: err});
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
 * Return the shopping list current user has access to
 *
 * URL: /api/shoppingList
 * method: GET
 */
router.get('/', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        }
        var p_id = req.session.person_id;
        connection.query('SELECT * ' +
            'FROM shopping_list LEFT JOIN currency USING(currency_id)  ' +
            'LEFT JOIN shopping_list_entry USING(shopping_list_id)  ' +
            'lEFT JOIN shopping_list_person USING(shopping_list_id) ' +
            'WHERE shopping_list_id IN  ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = ?  ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person  ' +
            'LEFT JOIN group_person USING(person_id) ' +
            'LEFT JOIN home_group USING(group_id) ' +
            'WHERE person.person_id = ? ' +
            'UNION ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?)',
            [p_id, p_id, p_id],
            function(err, result) {
                connection.release();
                if (err) {
                    return res.status(500).json({error: err});
                } else if (!result.length) {
                    return res.status(403).json({error: "no access/does not exist", success: false});
                }
                console.log(result);
                var shopping_lists = [];
                for (var i = 0; i < result.length;i++) {
                    var current_shopping_list_id = shoppingListExistsInArray(result[i].shopping_list_id, shopping_lists);
                    if (current_shopping_list_id == -1) {
                        shopping_lists.push({
                            "shopping_list_id":result[i].shopping_list_id,
                            "shopping_list_name":result[i].shopping_list_name,
                            "currency_id":result[i].currency_id,
                            "currency_short":result[i].currency_short,
                            "currency_long":result[i].currency_long,
                            "currency_sign":result[i].currency_sign,
                            "currency_major":result[i].currency_major,
                            "currency_long":result[i].currency_long,
                            "shopping_list_entries": [],
                            "person_ids": []
                        });
                        current_shopping_list_id = shopping_lists.length - 1;
                    }

                    if (result[i].shopping_list_entry_id) shopping_lists[current_shopping_list_id].shopping_list_entries.push({
                        "shopping_list_entry_id":result[i].shopping_list_entry_id,
                        "entry_text":result[i].entry_text,
                        "added_by_person_id":result[i].added_by_person_id,
                        "purchased_by_person_id":result[i].purchased_by_person_id,
                        "cost":result[i].cost,
                        "datetime_added":result[i].datetime_added,
                        "datetime_purchased":result[i].datetime_purchased
                    });

                    if (result[i].person_id) {
                        shopping_lists[current_shopping_list_id].person_ids.push(result[i].person_id);
                    }
                }
                for (i = 0; i < shopping_lists.length; i++) {
                    shopping_lists[i].shopping_list_entries = removeDuplicateUsingFilter(shopping_lists[i].shopping_list_entries);
                    shopping_lists[i].person_ids = removeDuplicateUsingFilter(shopping_lists[i].person_ids);
                }
                res.status(200).json(shopping_lists);
            }
        );
    });
});

/**
 * Get all info about one shoppinglist
 *
 * URL: /api/shoppingList/{shopping_list_id}
 * method: GET
 */
router.get('/:shopping_list_id', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        }
        var p_id = req.session.person_id;
        connection.query('SELECT * ' +
            'FROM shopping_list LEFT JOIN currency USING(currency_id)  ' +
            'LEFT JOIN shopping_list_entry USING(shopping_list_id)  ' +
            'lEFT JOIN shopping_list_person USING(shopping_list_id) ' +
            'WHERE shopping_list.shopping_list_id = ? AND shopping_list_id IN  ' +
            '(SELECT shopping_list_id FROM person WHERE person_id = ?  ' +
            'UNION  ' +
            'SELECT home_group.shopping_list_id FROM person  ' +
            'LEFT JOIN group_person USING(person_id) ' +
            'LEFT JOIN home_group USING(group_id) ' +
            'WHERE person.person_id = ? ' +
            'UNION ' +
            'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?)',
            [checkRange(req.params.shopping_list_id, 1, null), p_id, p_id, p_id],
            function(err, result) {
                connection.release();
                if (err) {
                    return res.status(500).json({error: err});
                } else if (!result.length) {
                    return res.status(403).json({error: "no access/does not exist", success: false});
                }
                var entries = [], person_ids = [];
                for (var i = 0; i < result.length; i++) {
                    if (result[i].shopping_list_entry_id) entries.push({
                        "shopping_list_entry_id":result[i].shopping_list_entry_id,
                        "entry_text":result[i].entry_text,
                        "added_by_person_id":result[i].added_by_person_id,
                        "purchased_by_person_id":result[i].purchased_by_person_id,
                        "cost":result[i].cost,
                        "datetime_added":result[i].datetime_added,
                        "datetime_purchased":result[i].datetime_purchased
                    });
                    if (result[i].person_id) {
                        person_ids.push(result[i].person_id);
                    }
                }
                res.status(200).json({
                    "shopping_list_id":result[0].shopping_list_id,
                    "shopping_list_name":result[0].shopping_list_name,
                    "currency_id":result[0].currency_id,
                    "currency_short":result[0].currency_short,
                    "currency_long":result[0].currency_long,
                    "currency_sign":result[0].currency_sign,
                    "currency_major":result[0].currency_major,
                    "currency_long":result[0].currency_long,
                    "shopping_list_entries": removeDuplicateUsingFilter(entries),
                    "person_ids": removeDuplicateUsingFilter(person_ids)
                });
            }
        );
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
            'datetime_purchased) ' +
            'SELECT 4, \'test\', 2, null, 0, null FROM shopping_list WHERE shopping_list_id IN   ' +
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

/**
 * Check for a database connection error and report if connected.
 */
function checkConnectionError(err, connection, res) {
    if(err) {
        connection.release();
        res.status(500).json({'Error' : 'connecting to database: ' } + err);
    }
}

/**
 * Check the result, release connection and return.
 */
function checkResult(err, result, connection, res) {
    connection.release();
    if (err) {
        res.status(500).json({error: err});
    } else if (result.affectedRows == 0) {
        res.status(403).json({error: "No access or does not exists"})
    } else {
        res.status(200).json({success: "Success"});
    }
}

/**
 * This is a separate method so the response to invalid
 * values can be changed easily, like throw errors.
 */
function checkRange(value, min, max) {
    if (min != null) {if (value < min) {return min;}}
    if (max != null) {if (value > max) {return max;}}
    return value;
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
    return unique_array
}

function shoppingListExistsInArray(shopping_list_id, array) {
	for (var i = 0; i < array.length;i++) {
		if (array[i].shopping_list_id == shopping_list_id) return i;
	}
	return -1;
}
