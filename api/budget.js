/**
 * @module Budget API
 */
var router = require('express').Router();

module.exports = router;

/**
 * Adds a new budget entry label for a shopping list
 *
 * @name Adds new budget entry label
 * @route {POST} /api/budget/entryType
 * @bodyparam {string} entry_type_name
 * @bodyparam {number} entry_type_color
 * @bodyparam {number} shopping_list_id
 *
 */
router.post('/entryType', function(req, res) {
    var data = req.body;
    console.log(data);
    pool.query('INSERT INTO budget_entry_type (entry_type_name, entry_type_color, shopping_list_id) SELECT ?, ?, ? ' +
        'FROM shopping_list WHERE shopping_list_id IN ' +
        '(SELECT home_group.shopping_list_id FROM person   ' +
        'LEFT JOIN group_person USING(person_id)  ' +
        'LEFT JOIN home_group USING(group_id)  ' +
        'WHERE person.person_id = ? ' +
        'UNION  ' +
        'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ? AND invite_accepted = 1) LIMIT 1',
        [data.entry_type_name, data.entry_type_color, data.shopping_list_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {
            if(err) return res.status(500).json({'Error' : err});
            if (result.rowsAffected == 0) return res.status(400).json({success: "false", error: "No access or does not exist"});
            res.status(200).json({success: "true", budget_entry_type_id: result.insertId});
    });
});

/**
 * Returns budget entry labels for a shopping list
 *
 * @name Returns a budget entry labels
 * @route {GET} /api/budget/entryType
 * @headerparam {number} shopping_list_id each shoppinglist receives a unique id
 *
 */
router.get('/entryType', function(req, res) {
    pool.query('SELECT * FROM budget_entry_type ' +
        'WHERE shopping_list_id = ? AND shopping_list_id IN ' +
        '(SELECT home_group.shopping_list_id FROM person   ' +
        'LEFT JOIN group_person USING(person_id)  ' +
        'LEFT JOIN home_group USING(group_id)  ' +
        'WHERE person.person_id = ? ' +
        'UNION  ' +
        'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ? AND invite_accepted = 1)',
        [req.query.shopping_list_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {
            if(err) return res.status(500).json({'Error' : err});
            var budget_entry_types = [];
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

/**
 * Edits budget entry label
 *
 * @name Edits budget entry label
 * @route {PUT} /api/budget/entryType/{budget_entry_type_id}
 * @bodyparam {string} budget_entry_name
 * @bodyparam {number} budget_entry_color
 *
 */
router.put('/entryType/:budget_entry_type_id', function(req, res) {
    var data = req.body;
    pool.query('UPDATE budget_entry_type ' +
        'SET ' +
        'entry_type_name = ?, ' +
        'entry_type_color = ? ' +
        'WHERE ' +
        'budget_entry_type_id = ? AND ' +
        'shopping_list_id IN ' +
        '(SELECT home_group.shopping_list_id FROM person   ' +
        'LEFT JOIN group_person USING(person_id)  ' +
        'LEFT JOIN home_group USING(group_id)  ' +
        'WHERE person.person_id = ? ' +
        'UNION  ' +
        'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ? AND invite_accepted = 1) LIMIT 1',
        [data.entry_type_name, data.entry_type_color, req.params.budget_entry_type_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {
            if (err) return res.status(500).json({'Error' : err});
            if (result.rowsAffected == 0) return res.status(400).json({success: "false", error: "No access or does not exist"});
            res.status(200).json({success: "true"});
    });
});

/**
 * Removes a budget entry label
 *
 * @name Removes a budget entry label
 * @route {DELETE} /api/budget/entryType/{budget_entry_type_id}
 *
 */
router.delete('/entryType/:budget_entry_type_id', function(req, res) {
    pool.query('DELETE FROM budget_entry_type ' +
        'WHERE budget_entry_type_id = ? AND ' +
        'shopping_list_id IN ' +
        '(SELECT home_group.shopping_list_id FROM person ' +
        'LEFT JOIN group_person USING(person_id) ' +
        'LEFT JOIN home_group USING(group_id) ' +
        'WHERE person.person_id = ? ' +
        'UNION ' +
        'SELECT shopping_list_id FROM shopping_list_person WHERE person_id = ?  AND invite_accepted = 1) LIMIT 1',
        [req.params.budget_entry_type_id, req.session.person_id, req.session.person_id, req.session.person_id], function(err, result) {
            if (err) return res.status(500).json({'Error' : err});
            if (result.rowsAffected == 0) return res.status(400).json({success: "false", error: "No access or does not exist"});
            res.status(200).json({success: "true"});
        });
});

/**
 * Adds a budget entry to shopping list
 *
 * @name Adds a budget entry to shopping list
 * @route {POST} /api/budget
 * @bodyparam {number} shopping_list_id
 * @bodyparam {number} amount
 * @bodyparam {string} text_note
 * @bodyparam {number} budget_entry_type_id
 * @bodyparam {array} shopping_list_entry_ids[]
 * @bodyparam {array} person_ids[]
 *
 */
router.post('/', function(req, res){
    console.log(req.body);
    req.body.shopping_list_entry_ids = req.body.shopping_list_entry_ids.split(",");
    if (req.body.person_ids)
        req.body.person_ids = req.body.person_ids.split(",");
    else
        req.body.person_ids = [];
    req.body.text_note = req.body.text_note.substring(0, 254);
    pool.getConnection(function(err, connection) {
        if (err)
            return res.status(500).send();
        connection.beginTransaction(function (err) {
            if (err)
                return res.status(500).send();
            connection.query('INSERT INTO budget_entry (budget_entry_type_id, shopping_list_id, added_by_id, amount, text_note) VALUES (?, ?, ?, ?, ?)',
                [req.body.budget_entry_type_id, req.body.shopping_list_id, req.session.person_id, req.body.amount, req.body.text_note], function (err, result) {
                    if (err) {
                        return connection.rollback(function () {
                            return res.status(500).send();
                        });
                    }
                    var qry = 'INSERT INTO person_budget_entry (budget_entry_id, person_id, datetime_paid) VALUES (?, ?, CURRENT_TIMESTAMP)';
                    var vals = [result.insertId, req.session.person_id];
                    for (var i = 0; i < req.body.person_ids.length; i++) {
                        if(req.body.person_ids[i] == req.session.person_id)
                            continue;
                        qry += ', (?, ?, NULL)';
                        vals.push(result.insertId, req.body.person_ids[i]);
                    }
                    connection.query(qry, vals, function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                return res.status(500).send();
                            });
                        }
                        qry = 'UPDATE shopping_list_entry SET budget_entry_id = ?, purchased_by_person_id = ?, datetime_purchased = CURRENT_TIMESTAMP WHERE shopping_list_entry_id IN (';
                        vals = [result.insertId, req.session.person_id];
                        for(var i = 0; i < req.body.shopping_list_entry_ids.length; i++){
                            if(i != 0)
                                qry += ', ';
                            qry += '?';
                            vals.push(req.body.shopping_list_entry_ids[i]);
                        }
                        qry += ')';
                        connection.query(qry, vals, function(err){
                            if (err) {
                                return connection.rollback(function () {
                                    return res.status(500).send();
                                });
                            }
                            connection.commit(function(err){
                                if (err) {
                                    return connection.rollback(function () {
                                        return res.status(500).send();
                                    });
                                }
                                connection.release();
                                res.status(200).json({budget_entry_id: result.insertId});
                            });
                        });
                    });
                });
        });
    });
});

/**
 * Get debt between logged in user and anyone else. Returns a json object, where the keys are person_ids, and their value
 * is balance between the user and the person_id.
 *
 * @name Get debt between logged in user and anyone else
 * @route {GET} /api/budget/getDebt
 *
 */
router.get('/getDebt', function(req,res) {
    var person_id = req.session.person_id;
    var sqlQuery = "SELECT amount, person_id, be.budget_entry_id, datetime_paid FROM budget_entry be " +
        "RIGHT JOIN person_budget_entry pbe USING (budget_entry_id) " +
        "WHERE added_by_id = ? AND be.added_by_id != pbe.person_id;";
    pool.query(sqlQuery, [person_id], function(err, result) {
        if(err) {
            return res.status(500).send("Internal database error (1)");
        }
        var count = {};
        var values ={};
        var id = 0;
        var pid = 0;
        result.forEach(function(el) {
            id = el.budget_entry_id;
            if(!count.hasOwnProperty(id)) {
                count[id] = 2; //+1 because the user isn't included in the results
            } else {
                count[id]++;
            }
        });
        result.forEach(function(el) {
            if(el.datetime_paid = "null") {
                id = el.budget_entry_id;
                pid = el.person_id;
                if (!values.hasOwnProperty(pid)) {
                    values[pid] = el.amount / count[id];
                } else {
                    values[pid] += el.amount / count[id];
                }
            }
        });
        sqlQuery = "SELECT COUNT(person_id) AS persons, budget_entry_id FROM person_budget_entry WHERE budget_entry_id IN (\n" +
            "SELECT budget_entry_id FROM person_budget_entry WHERE person_id = ?) GROUP BY budget_entry_id";
        pool.query(sqlQuery, [person_id], function(err, resOne) {
            if(err) {
                return res.status(500).send("Internal database error (2)");
            }
            count = {};
            resOne.forEach(function(el) {
                count[el.budget_entry_id] = el.persons;
            });
            sqlQuery = "SELECT added_by_id, amount, budget_entry_id FROM budget_entry WHERE budget_entry_id IN (SELECT budget_entry_id FROM person_budget_entry WHERE person_id = ?)";
            pool.query(sqlQuery, [person_id], function(err, resTwo) {
                if(err) {
                    return res.status(500).send("Internal database error (3)");
                }
                resTwo.forEach(function(el) {
                    pid = el.added_by_id;
                    id = el.budget_entry_id;
                    if(!values.hasOwnProperty(pid)) {
                        values[pid] = -(el.amount / count[id]);
                    } else {
                        values[pid] -= (el.amount / count[id]);
                    }
                });
                return res.status(200).json(values);
            });
        });
    });
});

/**
 * Get full budget for a shopping list
 *
 * @name Get full budget for a shopping list
 * @route {GET} /api/budget/{shopping_list_id}
 *
 */
router.get('/:shopping_list_id', function(req, res){
    if(isNaN(Number(req.params.shopping_list_id)))
        return res.status(500).send();
    pool.query('SELECT budget_entry_id, shopping_list_entry_id, entry_text, datetime_purchased, amount, text_note, entry_datetime, forename, lastname, entry_type_name, entry_type_color, person_id ' +
        'FROM shopping_list_entry ' +
        'LEFT JOIN budget_entry USING (budget_entry_id) ' +
        'LEFT JOIN person ON (added_by_id = person_id) ' +
        'LEFT JOIN budget_entry_type USING (budget_entry_type_id) ' +
        'WHERE shopping_list_entry.shopping_list_id = ? AND ' +
        'budget_entry_id IS NOT NULL ' +
        'ORDER BY budget_entry_id ASC', [req.params.shopping_list_id], function(err, result){
            if(err)
                return res.status(500).send();
            if(result.length == 0)
                return res.status(200).json({
                    my_balance: [],
                    budget: []
                });
            var budget = [];
            var qry = 'SELECT budget_entry_id, person_id, datetime_paid, forename, lastname FROM budget_entry LEFT JOIN person_budget_entry USING (budget_entry_id) LEFT JOIN person USING (person_id) WHERE budget_entry_id IN (?';
            var vals = [result[0].budget_entry_id];
            for(var i = 0; i < result.length; i++){
                var id = inArray(budget, result[i].budget_entry_id, 'budget_entry_id');
                if(id != -1){
                    budget[id].shopping_list_entries.push({
                        shopping_list_entry_id: result[i].shopping_list_entry_id,
                        entry_text: result[i].entry_text
                    });
                    continue;
                }
                var entry = {};
                entry.purchased_by = {
                    person_id: result[i].person_id,
                    forename: result[i].forename,
                    lastname: result[i].lastname
                };
                entry.entry_type = {
                    entry_type_name: result[i].entry_type_name,
                    entry_type_color: result[i].entry_type_color
                };
                entry.entry_datetime = result[i].entry_datetime;
                entry.text_note = result[i].entry_text;
                entry.amount = result[i].amount;
                entry.datetime_purchased = result[i].datetime_purchased;
                entry.budget_entry_id = result[i].budget_entry_id;
                entry.shopping_list_entries = [{
                    shopping_list_entry_id: result[i].shopping_list_entry_id,
                    entry_text: result[i].entry_text
                }];
                entry.persons_to_pay = [];
                budget.push(entry);
                if(i != 0) {
                    qry += ', ?';
                    vals.push(result[i].budget_entry_id);
                }
            }
            qry += ') ORDER BY budget_entry_id ASC';
            pool.query(qry, vals, function(err, result){
                if(err)
                    return res.status(500).send(err);
                for(var i = 0; i < result.length; i++){
                    var id = inArray(budget, result[i].budget_entry_id, 'budget_entry_id');
                    budget[id].persons_to_pay.push({
                        person_id: result[i].person_id,
                        forename: result[i].forename,
                        lastname: result[i].lastname,
                        datetime_paid: result[i].datetime_paid
                    });
                }
                res.status(200).json({
                    my_balance: balancedCalculation(budget, req.session.person_id),
                    budget: budget
                });
            });
    });
});

/**
 * Adds a to pay for a budget entry
 *
 * @name Adds a to pay for a budget entry
 * @route {POST} /api/budget/{budget_entry_id}
 * @bodyparam {array} person_ids[] Array of persons ids
 * @bodyparam {string} is_paid
 *
 */
router.post('/pay/:budget_entry_id', function(req, res) {
    var query = "", queryValues = [], payers = req.body.person_ids, budget_entry_id = req.params.budget_entry_id;
    if (payers.length === 0) return res.status(400).json({error: "no payers array"});
    for (var i = 0; i < payers.length;i++) {
        if (i !== 0) query += ", ";
        query += "( ?, ? " + ((req.body.is_paid) ? ',CURRENT_TIMESTAMP)': ',NULL )');
        queryValues[i*2] = budget_entry_id;
        queryValues[i*2+1] = payers[i];
    }

    pool.query('INSERT INTO person_budget_entry(budget_entry_id, person_id, datetime_paid' + ') VALUES ' + query, queryValues, function(err, result) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        else if (result.affectedRows === 0)
            res.status(403).json({success: "false", error: "no access"});
        else
            res.status(200).send();
    });
});

/**
 * Sets entries in person_budget_entry to paid, with the current timestamp
 *
 * @name Sets entries in person_budget_entry to paid
 * @route {PUT} /api/budget/paySpecific
 * @bodyparam {string} person_ids budget_entry_ids is a string, with ids separated by commas. example: "200,390,29"
 *
 */
router.put('/paySpecific', function(req, res) {
    console.log(req.body);
    if(req.body.person_ids == null) {
        return res.status(400).send("Bad request, no person_ids variable");
    }
    var ids = req.body.person_ids.split(",").concat([req.session.person_id]);
    var sqlQuery = "UPDATE person_budget_entry SET datetime_paid = CURRENT_TIMESTAMP " +
        "WHERE (person_id, budget_entry_id) IN " +
        "(SELECT t.person_id, t.budget_entry_id FROM " +
        "(SELECT person_budget_entry.person_id, person_budget_entry.budget_entry_id " +
        "FROM person_budget_entry " +
        "LEFT JOIN budget_entry USING (budget_entry_id) " +
        "WHERE person_id IN ";
    var p = "(";
    for(var i = 0; i < ids.length; i++) {
        if(ids[i].isNaN) {
            return res.status(400).send("Not a number: " + ids[i]);
        }
        p += "?, ";
    }
    p = p.slice(0,-2) + ")";
    sqlQuery += p + " AND " +
    "added_by_id IN " + p + " AND " +
    "datetime_paid IS NULL) t)";
    ids = ids.concat(ids);
    pool.query(sqlQuery,ids,function(err) {
        if(err) {
            return res.status(500).send("Internal database error");
        }
        return res.status(200).send("Query successful");
    });
});

/**
 * Sets entries in person_budget_entry to paid, with the current timestamp
 *
 * @name Sets entries in person_budget_entry to paid
 * @route {PUT} /api/budget
 * @bodyparam {number} person_id A persons unique id
 * @bodyparam {string} budget_entry_ids: "###,###,###,###" Is a string, with ids separated by commas. example: "200,390,29"
 *
 */
router.put('/pay', function(req, res) {
    console.log(req.body);
    if(req.body.person_id == null || req.body.person_id.isNaN) {
        return res.status(400).send("Bad request, no person_id variable");
    }
    if(req.body.budget_entry_ids == null) {
        return res.status(400).send("Bad request, no budget_entry_ids variable");
    }
    var ids = req.body.budget_entry_ids.split(",");
    var sqlQuery = "UPDATE person_budget_entry SET datetime_paid = CURRENT_TIMESTAMP WHERE " +
        "(person_id, budget_entry_id) IN " +
        "(SELECT t.person_id, t.budget_entry_id FROM " +
        "(SELECT person_budget_entry.person_id, person_budget_entry.budget_entry_id FROM " +
        "person_budget_entry " +
        "LEFT JOIN budget_entry USING (budget_entry_id) WHERE " +
        "((person_id = ? AND budget_entry_id IN (";
    for(var i = 0; i < ids.length; i++) {
        if(ids[i].isNaN) {
            return res.status(400).send("Not a number: " + ids[i]);
        }
        sqlQuery += "?, ";
    }
    sqlQuery = sqlQuery.slice(0,-2) + ")";
    sqlQuery += ") OR (person_id = ? AND added_by_id = ?)) AND datetime_paid IS NULL) t)";
    ids.unshift(req.body.person_id);
    ids.push(req.session.person_id, req.body.person_id);
    pool.query(sqlQuery,ids,function(err) {
        if(err) {
            return res.status(500).send("Internal database error");
        }
        return res.status(200).send("Query successful");
    });
});

/**
 * Get all budget entries with their type for a group. Only available to users in the group
 *
 * @name Budget entries with type for a group
 * @route {GET} /api/budget/entries
 * @headerparam {number} group_id A groups unique id
 *
 */

router.get('/', function(req, res) {
    if(req.session.person_id == null) {
        return res.status(403).send("Invalid request, you must log in");
    }
    if(req.query.group_id == null) {
        return res.status(400).send("Bad request, no group_id variable");
    }
    pool.query("SELECT group_id FROM group_person WHERE person_id = ?", [req.session.person_id], function(err, result) {
        if(err) {
            return res.status(500).send("Internal database error (1)");
        }
        var inGroup = false;
        result.forEach(function(element) {
            if(element.group_id == req.query.group_id) inGroup = true;
        });
        if(!inGroup) {
            return res.status(403).send("Invalid request, you do not have access to that information");
        }
        pool.query("SELECT shopping_list_id FROM home_group WHERE group_id = ?", [result[0].group_id], function(err, result) {
            if(err) return res.status(500).send("Internal server error (2)");
            var sql = "SELECT bet.entry_type_name, be.shopping_list_id, be.added_by_id, be.amount FROM budget_entry be" +
                " RIGHT JOIN budget_entry_type bet ON be.budget_entry_type_id = bet.budget_entry_type_id" +
                " WHERE bet.shopping_list_id = ? AND be.shopping_list_id = ?" +
                " UNION" +
                " SELECT NULL AS \"entry_type_name\", shopping_list_id, added_by_id, amount" +
                " FROM budget_entry WHERE budget_entry_type_id IS NULL AND shopping_list_id = ?",
                values = [req.query.group_id, req.query.group_id, req.query.group_id];
            pool.query(sql, values, function(err, result) {
                return res.status(200).json(result);
            });
        });
    });
});

function budgetEntryExistsInArray(budget_entry_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].budget_entry_id === budget_entry_id) return i;
    }
    return -1;
}

function shoppingListEntryExistsInArray(shopping_list_entry_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].shopping_list_entry_id === shopping_list_entry_id) return i;
    }
    return -1;
}

function payPersonExistsInArray(person_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].person_id === person_id) return i;
    }
    return -1;
}

function paidPersonExistsInArray(person_id, array) {
    for (var i = 0; i < array.length;i++) {
        if (array[i].person.person_id === person_id) return i;
    }
    return -1;
}

function balancedCalculation(budget, person_id){
    var persons = [];
    for(var i = 0; i < budget.length; i++){
        var entry = budget[i];
        if(inArray(entry.persons_to_pay, person_id, 'person_id') == -1 && entry.purchased_by.person_id != person_id)
            continue;
        for(var j = 0; j < entry.persons_to_pay.length; j++){
            console.log(entry.persons_to_pay[j]);
            if(entry.persons_to_pay[j].datetime_paid)
                continue;
            var k = inArray(persons, (entry.purchased_by.person_id == person_id ? entry.persons_to_pay[j].person_id : entry.purchased_by.person_id), 'person_id');
            if(k == -1) {
                persons.push({
                    person_id: (entry.purchased_by.person_id == person_id ? entry.persons_to_pay[j].person_id : entry.purchased_by.person_id),
                    forename: (entry.purchased_by.person_id == person_id ? entry.persons_to_pay[j].forename : entry.purchased_by.forename),
                    lastname: (entry.purchased_by.person_id == person_id ? entry.persons_to_pay[j].lastname : entry.purchased_by.lastname),
                    amount: (entry.purchased_by.person_id == person_id ? entry.amount / entry.persons_to_pay.length : -entry.amount / entry.persons_to_pay.length),
                    budget_entry_ids: [entry.budget_entry_id]
                });
            }
            else {
                persons[k].amount += (entry.purchased_by.person_id == person_id ? entry.amount / entry.persons_to_pay.length : -entry.amount / entry.persons_to_pay.length);
                persons[k].budget_entry_ids.push(entry.budget_entry_id);
            }
        }
    }
    return persons;
}

function inArray(arr, token, param){
    for(var i = 0; i < arr.length; i++){
        if(param) {
            if (arr[i][param] == token)
                return i;
        }
        else {
            if(arr[i] == token)
                return i;
        }
    }
    return -1;
}