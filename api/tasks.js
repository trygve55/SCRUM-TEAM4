var router = require('express').Router();

module.exports = router;

/**
 * Add new task to the group task list
 *
 * URL: /api/tasks
 * method: POST
 * data: {
 *      group_id,
 *      todo_text
 *
 *      Optional:
 *      datetime_deadline,
 *      datetime_done,
 *      done_by_id
 * }
*/
router.post('/', function(req, res) {
	var data = req.body;
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}
		connection.query(
			'INSERT INTO todo (' +
			'group_id, todo_text, datetime_deadline, datetime_done, created_by_id, done_by_id' +
			') VALUES (?,?,?,?,?,?);',
			[
				checkRange(data.group_id, 1, null),
				data.todo_text,
				data.datetime_deadline,
				data.datetime_done,
				checkRange(req.session.person_id, 1, null),	// data.created_by_id to test this.
				checkRange(data.done_by_id, 1, null)
			], function(err, result) {checkResult(err, result, connection, res);}
		);
	});
});

/**
 * Add a person to a task
 *
 * URL: /api/tasks/person/{todo_id}
 * method: POST
 * data: {
 *      people[] - contains an array of "person_id"-s.
 * }
*/
router.post('/person/:todo_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}
		var data = req.body.people;
		if (data.length < 0) {
			res.status(400).send();
			return;
		}

		var resultQuery = multipleRequestSetup(
										checkRange(req.params.todo_id, 1, null), data,
										'INSERT INTO todo_person (todo_id, person_id) VALUES ',
										'(?, ?)', false
									);
		
		connection.query(
			resultQuery[0], resultQuery[1],
			function(err, result) {
				if (!checkConnectionError(err, connection, res)) {return;}
				res.status(200).send();
			}
		);
	});
});

/**
 * Get the data about a private task
 *
 * URL: /api/tasks/private/{todo_id}
 * method: GET
 */
router.get('/private/:todo_id', function(req, res) {
    pool.getConnection(function(err, connection) {
        if (!checkConnectionError(err, connection, res))
            return;
        connection.query('SELECT * FROM private_todo WHERE todo.todo_id = ?',
            [req.params.todo_id], function(err, result) {
                connection.release();
                if (err)
                    return res.status(500).send();
                if (result.length > 0) {
                    var people = [];
                    for (var i = 0; i < result.length; i++)
                        people.push({"person_id":result[i].person_id});
                    var values = {};
                    for (var p in result[0])
                        values[p] = result[0][p];
                    delete values.person_id;
                    values.people = people;
                    res.status(200).json(values);
                }
                else
                    res.status(400).json(result);
            }
        );
    });
});

/**
 * Get the data about a task
 *
 * URL: /api/tasks/{todo_id}
 * method: GET
*/
router.get('/:todo_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		connection.query('SELECT * FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo.todo_id = ?',
			[req.params.todo_id], function(err, result) {
				connection.release();
				if (err) {
					return res.status(500).send();
				}
				if (result.length > 0) {
					var people = [];
					for (var i = 0; i < result.length; i++) {people.push({"person_id":result[i].person_id});}
					var values = {};
					for (var p in result[0]) {values[p] = result[0][p];}
					delete values.person_id;
					values.people = people;
					res.status(200).json(values);
				}
				else {res.status(400).json(result);}
			}
		);
	});
});

/**
 * Get all tasks for a user
 *
 * URL: /api/person/
 * The GET request for all tasks for a user.
*/
router.get('/person/:person_id', function(req, res) { // TODO FIX THIS
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		connection.query(
			'SELECT todo_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, created_by_id, done_by_id ' +
			'FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo_person.person_id = ? UNION (' +
			'SELECT todo_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, null, null ' +
			'FROM private_todo WHERE private_todo.person_id = ?) ;',
			[checkRange(req.params.person_id, 1, null),checkRange(req.params.person_id, 1, null)], function(err, result) {
				connection.release();
				if (err) {return res.status(500).send(err);}
				var entries = [];
				for (var i = 0; i < result.length; i++) {
					var values = {};
					for (var p in result[i]) {values[p] = result[i][p];}
					delete values.person_id;
					entries.push(values);
				}
				if (entries.length > 0) {res.status(200).json(entries);}
				else {res.status(400).json(result);}
			}
		);
	});
});

/**
 * Get all tasks for a user one hour into the future.
 *
 * URL: /api/notify/{person_id}
 * The GET request for all tasks for a user.
*/
router.get('/notify/:person_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}
		var id = req.params.person_id;

		connection.query(
			"(SELECT todo_id, todo_text, datetime_deadline, color_hex" +
			"FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo_person.person_id = ? " +
			"AND datetime_deadline BETWEEN CURRENT_TIMESTAMP() AND DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR) order by datetime_deadline desc)" +
			"UNION (SELECT todo_id, todo_text, datetime_deadline, color_hex" +
			"FROM private_todo WHERE private_todo.person_id = ? " +
			"AND datetime_deadline BETWEEN CURRENT_TIMESTAMP() AND DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR) order by datetime_deadline desc);",
			[id, id, function(err, result) {
				connection.release();
				if (err) {return res.status(500).send(err);}
				var entries = [];
				for (var i = 0; i < result.length; i++) {
					var values = {};
					for (var p in result[i]) {values[p] = result[i][p];}
					delete values.person_id;
					entries.push(values);
				}
				if (entries.length > 0) {res.status(200).json(entries);}
				else {res.status(400).json(result);}
			}
		);
	});
});

/**
 * Update a task
 *
 * URL: /api/tasks/{todo_id}
 * method: PUT
 * data: {
 *      sql attribute style parameters to set value
 * }
*/
router.put('/:todo_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		var query = putRequestSetup(checkRange(req.params.todo_id, 1, null), req.body, connection, "todo");
		connection.query(
			query[0], query[1],
			function(err, result) {checkResult(err, result, connection, res);}
		);
	});
});

/**
 * Remove a person from task
 *
 * URL: /api/tasks/person/{todo_id}
 * method: DELETE
 * data: {
 *      people[] - contains an array of "person_id"-s.
 * }
*/
router.delete('/person/:todo_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}
		
		var data = req.body.people, todo = checkRange(req.params.todo_id, 1, null);
		if (data.length < 0) {
			res.status(400).send();
			return;
		}
		
		var resultQuery = multipleRequestSetup(
										checkRange(req.params.todo_id, 1, null), data,
										'DELETE FROM todo_person WHERE todo_id = ? AND person_id IN (',
										'', true
									);
		resultQuery[0] += ')';

		connection.query(
			resultQuery[0], resultQuery[1],
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
		res.status(400).json({'Error' : (tableName + '_id not specified: ') } + err);
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
* Make the neccesary setup for multiple request.
*/
function multipleRequestSetup(iD, data, query, repetitiveElement, iDFirstOnly) {
	var inputs = [];
	if (iDFirstOnly) {inputs.push(iD);}
	for (var i = 0; i < data.length; i++) {
		query += repetitiveElement;
		if (!iDFirstOnly) {
			inputs.push(iD);
			inputs.push(checkRange(data[i], 1, null));
		}
		else {query += data[i];}
		if (i < data.length - 1) {query += ', ';}
	}
	console.log(query);
	console.log(inputs);
	return [query, inputs];
}

/**
* Check for a database connection error and report if connected.
*/
function checkConnectionError(err, connection, res) {
	if(err) {
		connection.release();
		res.status(500).json({'Error' : 'connecting to database: ' } + err);
		return false;
	}
	return true;
}

/**
* Check the result, release connection and return.
*/
function checkResult(err, result, connection, res) {
	connection.release();
	if (err) {throw err;}
	if (result) {res.status(200).send();}
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