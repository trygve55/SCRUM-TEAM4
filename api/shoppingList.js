var router = require('express').Router();

module.exports = router;

router.post('/', function(req, res) {
	console.log('POST-request established');

	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);
        if(err) {
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        }

		var data = req.body;

        connection.beginTransaction(function (err) {
            if(err) {
                connection.rollback(function () {
                    res.status(500).json({'Error' : err});
                    connection.release();
                });
            } else connection.query('INSERT INTO shopping_list ' +
                '(shopping_list_name, currency_id) VALUES (?,?)',
                [data.shopping_list_name, checkRange(data.currency_id, 1, null)],
                function(err, result1) {

                    if(err) {
                        connection.rollback(function () {
                            res.status(500).json({'Error' : err});
                            connection.release();
                        });
                    } else connection.query(
						'INSERT INTO shopping_list_person(' +
						'shopping_list_id, person_id, invite_accepted) ' +
						'VALUES (?,?,?);',
						[
							result1.insertId,
							req.session.person_id,
							true
						],
						function (err, result2) {
							if (err) {
								connection.rollback(function () {
									res.status(500).json({'Error': err});
									connection.release();
								});
							} else {
								connection.commit(function (err) {
									if (err) {
										connection.rollback(function () {
											res.status(500).json({'Error': err});
											connection.release();
										});
									} else {
										connection.release();
										res.status(200).json({success: "true", shopping_list_id: result1.insertId});
									}
								});
							}
						});
                }
            );
        });


	});
});

router.post('/invite', function(req, res) {
    console.log('POST-request established');

	pool.getConnection(function(err, connection) {
        checkConnectionError(err, connection, res);
        if(err) {
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        } else connection.query(
            'INSERT INTO shopping_list_person(' +
            'shopping_list_id, person_id) ' +
            'SELECT ?,? FROM shopping_list_person ' +
			'WHERE EXISTS (SELECT person_id FROM shopping_list_person WHERE person_id = ? AND shopping_list_id = ?) LIMIT 1;',
            [
                req.body.shopping_list_id,
                req.body.person_id,
				req.session.person_id,
				req.body.shopping_list_id
            ],
            function(err, result) {
                connection.release();
                if(err) {
                    res.status(500).json({'Error' : 'connecting to database: ' } + err);
                    return;
                } else if (result.affectedRows != 1) {
                	console.log(result);
                    res.status(403).json({success: "false", error: "no access"});
				} else {
                	res.status(200).json({success: "true"});
                }
        });
    });
});

router.put('/entry/:shopping_list_entry_id', function(req, res) {
    console.log('PUT-request initiating');

    if(!req.params.shopping_list_entry_id) {
        connection.release();
        res.status(400).json({'Error' : (tableName + '_id not specified: ') } + err);
        return;
    }

    pool.getConnection(function(err, connection) {
        checkConnectionError(err, connection, res);

        var query = putRequestSetup(req.params.shopping_list_entry_id, req, connection, "shopping_list_entry");
        console.log(query);
        connection.query(
            query[0],
            query[1],
            function(err, result) {
                console.log(result);
                checkResult(err, result, connection, res);
            });
    });
});

router.delete('/entry/:shopping_list_entry_id', function(req, res) {
    console.log('POST-request initiating');
    pool.getConnection(function(err, connection) {
        checkConnectionError(err, connection, res);

        //DELETE FROM shopping_list_entry WHERE shopping_list_id = listId AND shopping_list_entry_id = entryId;
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
            [checkRange(req.params.shopping_list_entry_id, 1, null)],
            function(err, result) {checkResult(err, result, connection, res);}
        );
    });
});

router.get('/:shopping_list_id', function(req, res) {
	console.log('GET-request established');

	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

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
				console.log(result);
				if (err) {
					res.status(500).json({error: err});
				} else if (!result.length) {
					res.status(403).json({error: "no access/does not exist", success: false});
				} else {
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
			}
		);
	});
});


router.post('/entry', function(req, res) {
	console.log('POST-request initiating');
	var data = req.body, purchased = null, p_id = req.session.person_id;;
	if (data.purchased_by_person_id) {purchased = checkRange(data.purchased_by_person_id, 1, null);}

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
			],
			function(err, result) {
				connection.release();
				console.log(result);
				if (err) {
					res.status(500).json({error: err});
				} else if (result.insertId == 0) {
                    res.status(400).json({error: "No access/does not exist"});
                } else {
                    res.status(200).json({shopping_cart_entry_id: result.insertId});
                }
			});
	});
});

router.put('/:shopping_list_id', function(req, res) {
	console.log('PUT-request initiating');

    if(!req.body.shopping_list_id) {
        res.status(400).json({'Error' : (tableName + '_id not specified: ') } + err);
        return;
    }

	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		//'UPDATE shopping_list SET shopping_list_name = ?, currency_id = ? WHERE shopping_list_id = ?'
		var query = putRequestSetup(req.params.shopping_list_id ,req , connection, "shopping_list");
		connection.query(
			query[0],
			query[1],
			function(err, result) {checkResult(err, result, connection, res);}
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
		return;
	}
	console.log('Database connection established');
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
    var unique_array = arr.filter(function(elem, index, self) {
        if (index == 0) {
            console.log(elem);
            console.log(index);
            //console.log(self);
            console.log(elem.shopping_list_entry_id);
            console.log(self[index].shopping_list_entry_id);
            console.log(!!elem.shopping_list_entry_id);
        }
        return ((!!elem.shopping_list_entry_id) ? elem.shopping_list_entry_id == self[index].shopping_list_entry_id : index == self.indexOf(elem));
    });
    return unique_array
}