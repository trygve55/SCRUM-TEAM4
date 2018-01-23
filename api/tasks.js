var router = require('express').Router();

module.exports = router;

/**
 * Get all tasks to be notified about.
 *
 * URL: /api/tasks/notify/
*/

router.get('/notify', function(req, res) {
	pool.query(
        "(SELECT person_id, todo_id, todo_text, datetime_deadline, color_hex, null AS private_list_id FROM " +
        "todo LEFT JOIN todo_person USING(todo_id) WHERE " +
        "datetime_deadline < DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL '24:1' HOUR_MINUTE) " +
        "AND person_id IS NOT NULL AND datetime_done IS NULL ORDER BY datetime_deadline ASC) " +
        "UNION " +
        "(SELECT person_id, private_todo_entry_id, todo_text, datetime_deadline, color_hex, private_todo_list_id FROM " +
        "private_todo_list LEFT JOIN private_todo_entry USING(private_todo_list_id) WHERE " +
        "datetime_deadline < DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL '24:1' HOUR_MINUTE) AND " +
        "datetime_done IS NULL ORDER BY datetime_deadline ASC);",
        [], function(err, result) {
            if (err) {return res.status(500).send(err);}
            else {res.status(200).json(result);}
        }
    );
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
		
		pool.query(resultQuery[0], resultQuery[1], function(err) {
			if(err) { res.status(500).send(); }
				res.status(200).send();
            }
        );
});

/**
 * Get the data about a private task
 *
 * URL: /api/tasks/private/{todo_id}
 * method: GET
 */
router.get('/private/:todo_id', function(req, res) {
    pool.query('SELECT * FROM private_todo_entry WHERE todo.todo_id = ?',
        [req.params.todo_id], function(err, result) {
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

/**
 * Get all tasks for a user
 *
 * URL: /api/tasks/person
* The GET request for all tasks for a user.
*/
router.get('/person/:person_id?*', function(req, res) { // TODO FIX THIS
	console.log("HEy YO");
	if(!req.params.person_id)
		req.params.person_id = req.session.person_id;
	pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        }

		connection.query(
			'SELECT todo_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, created_by_id, done_by_id ' +
			'FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo_person.person_id = ?;',
			[checkRange(req.params.person_id, 1, null)], function(err, result) {
				connection.release();
				if (err) {return res.status(500).send(err);}
				var entries = [];
				for (var i = 0; i < result.length; i++) {
					var values = {};
					for (var p in result[i]) {values[p] = result[i][p];}
					delete values.person_id;
					entries.push(values);
				}
				console.log(entries);
				res.status(200).json(entries);
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
router.get('/person/:person_id', function(req, res) {
	pool.query(
        'SELECT todo_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, created_by_id, done_by_id ' +
        'FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo_person.person_id = ? UNION (' +
        'SELECT private_todo_entry_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, null, null ' +
        'FROM private_todo_list LEFT JOIN private_todo_entry USING(private_todo_list_id) WHERE private_todo_list.person_id = ?) ;',
        [checkRange(req.params.person_id, 1, null),checkRange(req.params.person_id, 1, null)], function(err, result) {
            if (err) {return res.status(500).send(err);}
            var entries = [];
            for (var i = 0; i < result.length; i++) {
                var values = {}; for (var p in result[i]) {values[p] = result[i][p];}
                delete values.person_id;
                entries.push(values);
            }
            if (entries.length > 0) {res.status(200).json(entries);}
            else {res.status(400).json(result);}
        }
    );
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
    var query = putRequestSetup(checkRange(req.params.todo_id, 1, null), req.body, "todo");
    pool.query(
        query[0], query[1],
        function(err, result) {checkResult(err, result, res);}
    );
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

    pool.query(
        resultQuery[0], resultQuery[1],
        function(err, result) {
            checkResult(err, result, res);
        }
    );
});

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
 * Get the data about a task
 *
 * URL: /api/tasks/{todo_id}
 * method: GET
 */
router.get('/todo/:todo_id', function(req, res) {
	pool.query('SELECT * FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo.todo_id = ?',
		[req.params.todo_id], function(err, result) {
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

/**
 * Get all tasks for a group
 *
 * URL: /api/tasks/{group_id}
 * method: GET
 */
router.get('/:group_id', function(req, res) {
	pool.query('SELECT todo_id, datetime_deadline, datetime_added, datetime_done, forename, middlename, lastname, todo_text, is_deactivated, color_hex FROM todo LEFT JOIN home_group USING (group_id) LEFT Join person ON done_by_id = person.person_id WHERE group_id = ?',
	[req.params.group_id], function(err, result){
			if(err)
				return res.status(500).send();
			res.status(200).json(result);
		});
});

// Help methods:

/**
* Make the neccesary setup for a put request.
*/
function putRequestSetup(iD, data, tableName) {
	if(!iD) {
        return res.status(400).json({'Error' : (tableName + '_id not specified: ') } + err);
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
* Check the result, release connection and return.
*/

function checkResult(err, result, res) {
	if (err)
		return res.status(500).send()
	if (result)
		res.status(200).send();
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