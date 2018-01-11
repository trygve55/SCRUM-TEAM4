var router = require('express').Router();

module.exports = router;

router.post('/', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

        var shopping_list = req.body;

        var values = [
            shopping_list.shopping_list_name,
            shopping_list.currency_id
        ];

        connection.query('INSERT INTO shopping_list ' +
            '(shopping_list_name, currency_id) VALUES (?,?)', values, function(err, result) {
            connection.release();

            if (err) {throw err;}
            if (result) {res.json({success: "true", shopping_list_id: result.insertId});}
        });
    });
});

router.get('/:shopping_list_id', function(req, res){
    console.log('GET-request established');
    pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

        connection.query('SELECT shopping_list_id, shopping_list_name, currency_id ' +
            'FROM shopping_list WHERE shopping_list_id = ?;', [req.params.shopping_list_id],
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

router.post('/entry', function(req, res) {
	var data = req.body;
	
	var datetimePurchased = null, purchasedByPersonId = null;
	
	if (data.purchasedByPersonId) {purchasedByPersonId = data.purchased_by_person_id}
	if (data.datetimePurchased) {datetimePurchased = data.datetime_purchased;}
	
	console.log('POST-request initiating');
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
				data.shopping_list_id,
				data.entry_text,
				data.added_by_person_id,	// This might be incorrect as this variable is not decided at this time.
				purchasedByPersonId,
				data.cost,
				datetimePurchased
			],
			function(err, result) {checkResult(err, result, connection, res);});
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

router.delete('/entry/:shopping_list_entry_id', function(req, res) {	// Delete
	console.log('POST-request initiating');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		//DELETE FROM shopping_list_entry WHERE shopping_list_id = listId AND shopping_list_entry_id = entryId;
		connection.query(
			'DELETE FROM shopping_list_entry WHERE shopping_list_entry_id = ?',
			[req.params.shopping_list_entry_id],
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