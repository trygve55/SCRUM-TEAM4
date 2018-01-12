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

		connection.query('INSERT INTO shopping_list ' +
			'(shopping_list_name, currency_id) VALUES (?,?)',
			[data.shopping_list_name, checkRange(data.currency_id, 1, null)],
			function(err, result1) {

                if(err) {
                	connection.release();
                    res.status(500).json({'Error' : 'connecting to database: ' } + err);
                    return;
                }

                connection.query(
                    'INSERT INTO shopping_list_person(' +
                    'shopping_list_id, person_id, invite_accepted) ' +
                    '(?,?,?);',
                    [
                        result1.insertId,
                        req.session.person_id,
                        true
                    ],
                    function(err, result) {
                        connection.release();
                        if(err) {
                            res.status(500).json({'Error' : 'connecting to database: ' } + err);
                            return;
                        }
                        if (result) {res.json({success: "true", shopping_list_id: result.insertId});}
                    });
			}
		);
	});
});

router.get('/:shopping_list_id', function(req, res) {
	console.log('GET-request established');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		connection.query('SELECT * ' +
			'FROM shopping_list LEFT JOIN currency USING(currency_id) ' +
			'LEFT JOIN shopping_list_entry USING(shopping_list_id) WHERE ' +
			'shopping_list.shopping_list_id = ?',
			[req.params.shopping_list_id],
			function(err, result) {
				connection.release();
				if (err) {throw err;}
				if (result) {
					var length = result.length, entries = [];
					for (i = 0; i < result.length; i++) {
						entries.push({
							"shopping_list_entry_id":result[i].shopping_list_entry_id,
							"entry_text":result[i].entry_text,
							"added_by_person_id":result[i].added_by_person_id,
							"purchased_by_person_id":result[i].purchased_by_person_id,
							"cost":result[i].cost,
							"datetime_added":result[i].datetime_added,
							"datetime_purchased":result[i].datetime_purchased
						});
					}
					res.json({
						"shopping_list_id":result[0].shopping_list_id,
						"shopping_list_name":result[0].shopping_list_name,
						"currency_id":result[0].currency_id,
						"currency_short":result[0].currency_short,
						"currency_long":result[0].currency_long,
						"currency_sign":result[0].currency_sign,
						"currency_major":result[0].currency_major,
						"currency_long":result[0].currency_long,
						"shopping_list_entries":entries
					});
				}
			}
		);
	});
});


router.post('/entry', function(req, res) {
	console.log('POST-request initiating');
	var data = req.body, purchased = null;
	if (data.purchased_by_person_id) {purchased = checkRange(data.purchased_by_person_id, 1, null);}

	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);
		connection.query(
			'INSERT INTO shopping_list_entry( ' +
			'shopping_list_id, ' +
			'entry_text, ' +
			'added_by_person_id,' +
			'purchased_by_person_id, ' +
			'datetime_added, ' +
			'cost, ' +
			'datetime_purchased) ' +
			'VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?);',
			
			[
				checkRange(data.shopping_list_id, 1, null),
				data.entry_text,
				checkRange(data.added_by_person_id, 1, null),	// This might be incorrect.
				purchased,
				data.cost,
				data.datetime_purchased
			],
			function(err, result) {checkResult(err, result, connection, res);});
	});
});

router.post('/:shopping_list_id', function(req, res) {
	var data = req.body;
//	var people = data.persons;	// Array

	console.log('POST-request initiating');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);
		connection.query(
			'INSERT INTO shopping_list_person(' +
			'shopping_list_id, person_id, paid_amount, ' +
			'invite_accepted, invite_sent_datetime, is_hidden, pay_amount_points) ' +
			'SELECT @listID:=?,?,?,?, CURRENT_TIMESTAMP,?,? FROM shopping_list ' +
			'WHERE NOT EXISTS (SELECT shopping_list.shopping_list_id FROM ' +
			'home_group,person,shopping_list WHERE person.shopping_list_id = @listID OR ' +
			'home_group.shopping_list_id = @listID) OR NOT EXISTS ' +
			'(SELECT person_id FROM shopping_list_person WHERE shopping_list_id = @listID) LIMIT 1;',
			[
				checkRange(req.params.shopping_list_id, 1, null),
				checkRange(data.person_id, 1, null),
				data.paid_amount,
				data.invite_accepted,
				data.is_hidden,
				checkRange(data.pay_amount_points, 0, null)
			],
			function(err, result) {checkResult(err, result, connection, res);}
		);
	});
});

router.put('/:shopping_list_id', function(req, res) {
	console.log('PUT-request initiating');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		//'UPDATE shopping_list SET shopping_list_name = ?, currency_id = ? WHERE shopping_list_id = ?'
		var query = putRequestSetup(req.params.shopping_list_id, req.body, connection, "shopping_list");
		connection.query(
			query[0],
			query[1],
			function(err, result) {checkResult(err, result, connection, res);}
		);
	});
});

router.put('/entry/:shopping_list_entry_id', function(req, res) {
	console.log('PUT-request initiating');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		var query = putRequestSetup(req.params.shopping_list_entry_id, req.body, connection, "shopping_list_entry");
		connection.query(
			query[0],
			query[1],
			function(err, result) {checkResult(err, result, connection, res);});
	});
});

router.delete('/entry/:shopping_list_entry_id', function(req, res) {
	console.log('POST-request initiating');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		//DELETE FROM shopping_list_entry WHERE shopping_list_id = listId AND shopping_list_entry_id = entryId;
		connection.query(
			'DELETE FROM shopping_list_entry WHERE shopping_list_entry_id = ?',
			[checkRange(req.params.shopping_list_entry_id, 1, null)],
			function(err, result) {checkResult(err, result, connection, res);}
		);
	});
});

// Help methods:

/**
* Make the neccesary setup for a put request.
*/
function putRequestSetup(iD, data, connection, tableName) {
	if(!iD) {
		connection.release();
		res.status(400);
		res.json({'Error' : (tableName + '_id not specified: ') } + err);
		return;
	}
	var parameters = [], request = 'UPDATE ' + tableName + ' SET ';
	var first = true;
	for (var k in data) {
		if (!first) {request += ', ';}
		else {first = false;}
		request += k + ' = ?';
		parameters.push(data[k]);
	}
	request += ' WHERE ' + tableName + '_id = ' + iD;
	return [request, parameters];
}

/**
* Check for a database connection error and report if connected.
*/
function checkConnectionError(err, connection, res) {
	if(err) {
		connection.release();
		res.status(500);
		res.json({'Error' : 'connecting to database: ' } + err);
		return;
	}
	console.log('Database connection established');
}

/**
* Check the result, release connection and return.
*/
function checkResult(err, result, connection, res) {
	connection.release();
	if (err) {throw err;}
	if (result) {res.json({success: "Success"});}
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