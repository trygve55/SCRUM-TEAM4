var router = require('express').Router();

module.exports = router;

router.post('/', function(req, res) {
	console.log('POST-request established');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);
		var data = req.body;

		connection.query(
			'INSERT INTO todo (' +
			'group_id, todo_text, datetime_deadline, datetime_done, ' +
			'datetime_added, created_by_id, done_by_id) ' +
			'VALUES (?,?,?,?,CURRENT_TIMESTAMP,?,?)',
			[
				checkRange(data.group_id, 1, null),
				data.todo_text,
				data.datetime_deadline,
				data.datetime_done,
				checkRange(req.session.person_id, 1, null),
				checkRange(data.done_by_id, 1, null)
			],
			function(err, result) {
				connection.release();
				if (err) {throw err;}
				if (result) {res.json({success: "Success", todo_id: result.insertId});}
			}
		);
	});
});

router.get('/:todo_id', function(req, res) {
	console.log('GET-request established');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		connection.query('SELECT * FROM todo WHERE todo.todo_id = ?',
			[checkRange(req.params.todo_id, 1, null))],
			function(err, result) {
				connection.release();
				if (err) {throw err;}
				if (result) {res.json({result});}
			}
		);
	});
});

router.get('/person/:person_id', function(req, res) {
	console.log('GET-request established');
	pool.getConnection(function(err, connection) {
		checkConnectionError(err, connection, res);

		connection.query(
			'SELECT person_id, todo_id, todo_text, datetime_deadline, ' +
			'datetime_added, datetime_done, created_by_id, done_by_id' +
			'FROM person LEFT JOIN todo_person USING(person_id) ' +
			'LEFT JOIN todo USING(todo_id) WHERE todo_person.person_id = ?',
			[checkRange(req.params.person_id, 1, null))],
			function(err, result) {
				connection.release();
				if (err) {throw err;}
				if (result) {
					var length = result.length, entries = [];
					for (i = 0; i < result.length; i++) {
						entries.push({
							"todo_id":result[i].todo_id,
							"todo_text":result[i].todo_text,
							"datetime_deadline":result[i].datetime_deadline,
							"datetime_added":result[i].datetime_added,
							"datetime_done":result[i].datetime_done,
							"created_by_id":result[i].created_by_id,
							"done_by_id":result[i].done_by_id
						});
					}
					res.json({
						"person_id":result[0].person_id,
						"person_tasks":entries
					});
				}
			}
		);
	});
});

// Help methods:

/**
* Make the neccesary setup for a put request.
*/
/*function putRequestSetup(iD, data, connection, tableName) {
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
}*/

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