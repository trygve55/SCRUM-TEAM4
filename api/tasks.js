/**
 * @module Group Task API
 */
var router = require('express').Router();

/* 
 * Milliseconeds in one day.
 * Also, extra delay for deadlines to make sure the last day is included for repeating tasks.
*/
const MILLIS_DAY = 86400000, EXTRA_DELAY = 10000;

module.exports = router;

/**
 * Get all tasks to be notified about.
 *
 * @name Get all tasks to be notified about
 * @route {GET} /api/tasks/notify/
 *
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
        [], function(err, result) {return (err) ? (res.status(500).send(err)) : (res.status(200).json(result));}
    );
});

/**
 * Get the data for all tasks that repeat.
 *
 * @name Get data for all tasks that repeat
 * @route {GET} /api/tasks/repeat/{group_id}
 *
*/
router.get('/repeat/:group_id', function(req, res) {
	pool.query(
		'SELECT todo.*, person_id, forename, lastname ' +
		'FROM todo LEFT JOIN todo_person USING(todo_id) LEFT JOIN person USING(person_id) ' +
		'WHERE group_id = ? AND autogen_id != 0',
		[req.params.group_id], function(err, result) {
			if (err) {return res.status(500).send();}
			return (result.length > 0) ? (res.status(200).json(result)) : (res.status(400).json(result));
		}
	);
});

/**
 * Add a person to a task
 *
 * @name Add person to task
 * @route {POST} /api/tasks/person/{todo_id}
 * @bodyparam {array} people contains an array of "person_id"-s.
 *
*/
router.post('/person/:todo_id', function(req, res) {
	var data = req.body.people.split(',');
	if (data.length < 0) {return res.status(400).send();}

	var resultQuery = multipleRequestSetup(
		checkRange(req.params.todo_id, 1, null), data,
		'INSERT INTO todo_person (todo_id, person_id) VALUES ',
		'(?, ?)', false
	);
	
	pool.query(resultQuery[0], resultQuery[1], function(err) {
	    if (err && err.code == 'ER_DUP_ENTRY') return pool.query(
            'UPDATE todo_person SET person_id = ? WHERE todo_id = ?',
	        [data, req.params.todo_id],
	        function (err) {
                return (err) ? (res.status(500).send()) : (res.status(200).send());
        });
		return (err) ? (res.status(500).send()) : (res.status(200).send());
	});
});

/**
 * Get the data about a private task
 *
 * @name Get data about private task
 * @route {GET} /api/tasks/private/{todo_id}
 *
 */
router.get('/private/:todo_id', function(req, res) {
    pool.query(
		'SELECT * FROM private_todo_entry WHERE private_todo_entry_id = ?',
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
                return res.status(200).json(values);
            }
            res.status(400).json(result);
        }
    );
});

/**
 * The GET request for all tasks for a user.
 *
 * @name Get tasks for user
 * @route {GET} /api/tasks/person
 *
*/
router.get('/person/:person_id?*', function(req, res) { // TODO FIX THIS
	if(!req.params.person_id)
		req.params.person_id = req.session.person_id;

	pool.query('SELECT todo_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, created_by_id, done_by_id ' +
        		'FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo_person.person_id = ?;',
        		[checkRange(req.params.person_id, 1, null)], function(err, result) {
		if (err) {return res.status(500).send(err);}
		// Arrange the results in an array with less repetition.
		var entries = [];
		for (var i = 0; i < result.length; i++) {
			var values = {};
			for (var p in result[i]) {values[p] = result[i][p];}
			delete values.person_id;
			entries.push(values);
		}
		res.status(200).json(entries);
        });
});

/**
 * Get all tasks for a user
 *
 * @name Tasks for user
 * @route {GET} /api/person/
 *
*/
router.get('/person/:person_id', function(req, res) {
	pool.query(
        'SELECT todo_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, created_by_id, done_by_id ' +
        'FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo_person.person_id = ? UNION (' +
        'SELECT private_todo_entry_id, todo_text, datetime_deadline, datetime_added, datetime_done, is_deactivated, color_hex, null, null ' +
        'FROM private_todo_list LEFT JOIN private_todo_entry USING(private_todo_list_id) WHERE private_todo_list.person_id = ?) ;',
        [checkRange(req.params.person_id, 1, null), checkRange(req.params.person_id, 1, null)], function(err, result) {
            if (err) {return res.status(500).send(err);}
			// Arrange the results in an array with less repetition.
            var entries = [];
            for (var i = 0; i < result.length; i++) {
                var values = {}; for (var p in result[i]) {values[p] = result[i][p];}
                delete values.person_id;
                entries.push(values);
            }
            return (entries.length > 0) ? (res.status(200).json(entries)) : (res.status(400).json(result));
        }
    );
});

/**
 * Set a task as completed
 *
 * @name Set task as completed
 * @route {PUT} /api/tasks/{todo_id}
 *
 */
router.put('/:todo_id/done', function(req, res) {
    pool.query('UPDATE todo SET datetime_done = CURRENT_TIMESTAMP, done_by_id = ? ' +
        'WHERE todo_id = ? AND todo_id IN ' +
        '(SELECT t.todo_id FROM ' +
        '(SELECT * FROM todo ' +
        'LEFT JOIN group_person USING (group_id) ' +
        'WHERE person_id = ?) t)', [req.session.person_id, req.params.todo_id, req.session.person_id], function(err, result) {
            pool.query('SELECT todo_id, datetime_deadline, datetime_added, datetime_done, forename, middlename, lastname, todo_text, is_deactivated, color_hex, todo.group_id FROM todo LEFT JOIN home_group USING (group_id) LEFT Join person ON done_by_id = person.person_id WHERE todo_id = ?',
                [req.params.todo_id], function(err, result){
                    if(err)
                        return res.status(500).send();
                    else if(result.length == 0)
                        return res.status(500).send();
                    socket.group_data('group task', result[0].group_id, result);
                    return res.status(200).send();
                });
    });
});

/**
 * Set a task that is done to be not done after all
 *
 * @name Set tasks that is done to be not done after all
 * @route {PUT} /api/tasks/{todo_id}
 *
 */
router.put('/:todo_id/undo', function(req, res) {
    pool.query('UPDATE todo SET datetime_done = NULL, done_by_id = NULL ' +
        'WHERE todo_id = ? AND todo_id IN ' +
        '(SELECT t.todo_id FROM ' +
        '(SELECT * FROM todo ' +
        'LEFT JOIN group_person USING (group_id) ' +
        'WHERE person_id = ?) t)', [req.params.todo_id, req.session.person_id], function(err, result) {
            pool.query('SELECT todo_id, datetime_deadline, datetime_added, datetime_done, forename, middlename, lastname, todo_text, is_deactivated, color_hex, todo.group_id FROM todo LEFT JOIN home_group USING (group_id) LEFT Join person ON done_by_id = person.person_id WHERE todo_id = ?',
                [req.params.todo_id], function(err, result){
                    if(err)
                        return res.status(500).send();
                    else if(result.length == 0)
                        return res.status(500).send();
                    socket.group_data('group task', result[0].group_id, result);
                    return res.status(200).send();
                });
    });
});

/**
 * Update a task with the provided data
 *
 * @name Update task
 * @route {PUT} /api/tasks/{todo_id}
 * @bodyparam {SQL} sql attribute style parameters to set value
 *
 */
router.put('/:todo_id', function(req, res) {
    var query = putRequestSetup(checkRange(req.params.todo_id, 1, null), req.body, "todo");
    pool.query(query[0], query[1], function(err, result) {
        pool.query('SELECT todo_id, datetime_deadline, datetime_added, datetime_done, forename, middlename, lastname, todo_text, is_deactivated, color_hex, todo.group_id FROM todo LEFT JOIN home_group USING (group_id) LEFT Join person ON done_by_id = person.person_id WHERE todo_id = ?',
            [req.params.todo_id], function(err, result){
                if(err)
                    return res.status(500).send();
                else if(result.length == 0)
                    return res.status(500).send();
                socket.group_data('group task', result[0].group_id, result);
                return res.status(200).send();
            });
    });
});

/**
 * Remove a person from task
 *
 * @name Remove person from task
 * @route {DELETE} /api/tasks/person/{todo_id}
 * @bodyparam {array} people contains an array of "person_id"-s.
 *
*/
router.delete('/person/:todo_id', function(req, res) {
    var data = req.body.people, todo = checkRange(req.params.todo_id, 1, null);
    if (data.length < 0) {return res.status(400).send();}
    var resultQuery = multipleRequestSetup(
        checkRange(req.params.todo_id, 1, null), data,
        'DELETE FROM todo_person WHERE todo_id = ? AND person_id IN (',
        '', true
    );
    pool.query(resultQuery[0] + ')', resultQuery[1], function(err, result) {checkResult(err, result, res);});
});

/**
 * Get the data about a task
 *
 * @name Get data about task
 * @route {GET} /api/tasks/todo/{todo_id}
 *
 */
router.get('/todo/:todo_id', function(req, res) {
	pool.query('SELECT * FROM todo LEFT JOIN todo_person USING(todo_id) WHERE todo.todo_id = ?',
		[req.params.todo_id], function(err, result) {
			if (err)
				return res.status(500).send();
			if (result.length == 0)
                return res.status(400).json(result);
            var people = [];
            for (var i = 0; i < result.length; i++) {people.push({"person_id":result[i].person_id});}
            var values = {};
            for (var p in result[0]) {values[p] = result[0][p];}
            delete values.person_id;
            values.people = people;
            return res.status(200).json(values);
		}
	);
});

/**
 * Delete the todo item
 *
 * @name Delete todo item
 * @route {DELETE} /api/tasks/todo/{todo_id}
 *
 */
router.delete('/todo/:todo_id', function(req, res){
    pool.query('SELECT group_id FROM todo WHERE todo_id = ?', [req.params.todo_id], function(err, result){
        if(err || result.length == 0)
            return res.status(500).send(err);
        pool.query('UPDATE todo SET is_deactivated = 1 WHERE todo_id = ?', [req.params.todo_id], function(err) {
            if(err)
                return res.status(500).send(err);
            socket.group_data('group task remove', result[0].group_id, req.params.todo_id);
            return res.status(200).send();
        });
    });
});

/**
 * Get all tasks for a group
 *
 * @name Tasks for group
 * @route {GET} /api/tasks/{group_id}
 *
 */
router.get('/:group_id', function(req, res) {
	pool.query('SELECT todo_id, datetime_deadline, datetime_added, datetime_done, forename, middlename, lastname, todo_text, is_deactivated, color_hex FROM todo LEFT JOIN home_group USING (group_id) LEFT Join person ON done_by_id = person.person_id WHERE group_id = ?',
		[req.params.group_id], function(err, result){
	        if(err)
	            return res.status(500).send();
            if(result.length == 0)
                return res.status(200).json(result);
	        var qry = "SELECT forename, middlename, lastname, todo_id FROM todo LEFT JOIN todo_person USING (todo_id) LEFT JOIN person USING (person_id) WHERE todo_id IN (";
            var vals = [];
			for(var i = 0; i < result.length; i++){
	            if(i != 0)
	                qry += ", ";
	            qry += "?";
                vals.push(result[i].todo_id);
            }
            qry += ");";
			pool.query(qry, vals, function (err, ret) {
			    if(err)
			        return res.status(500).send();
                for(var i = 0; i < result.length; i++){
                    for(var j = 0; j < ret.length; j++){
                        if(result[i].todo_id == ret[j].todo_id) {
                            result[i].assigned_to = {
                                forename: ret[i].forename,
                                middlename: ret[i].middlename,
                                lastname: ret[i].lastname
                            };
                        }
                    }
                }
                res.status(200).json(result);
            });
		});
});

/**
 * Add new task to the group task list.
 * The task will be made a repeating if time_interval is specified and > 0.
 * It will repeat until the date specified as deadline.
 *
 * @name New task to group task list
 * @route {POST} /api/tasks
 * @bodyparam {number} group_id the groups id
 * @bodyparam {string} todo_text what the task involves
 * @bodyparam {number} datetime_deadline set deadline for task (Optional)
 * @bodyparam {number} datetime_done when task is done (Optional)
 * @bodyparam {number} time_interval number of days
 *
 */
router.post('/', function(req, res) {
    var data = req.body, input = [];
    var query = "INSERT INTO todo (datetime_deadline, group_id, todo_text, datetime_done, created_by_id, done_by_id, autogen_id) VALUES ";
    if (data.time_interval > 0) {
        // Find the maximum autogen_id and increment it. This ensures that it will be unique.
        pool.query("SELECT MAX(autogen_id) AS auto FROM todo;", [], function(err, result) {
            if (err) {return res.status(500).send();}
            var auto = result[0].auto ? (result[0].auto + 1) : 1;

            var all = [data.group_id, data.todo_text, null, req.session.person_id, null, auto], interval = Math.round(data.time_interval * MILLIS_DAY);
            var end = new Date(new Date(data.datetime_deadline).getTime() + EXTRA_DELAY);
            for (var i = new Date(new Date().getTime() + interval); i <= end; i.setTime(i.getTime() + interval)) {
                query += "(?,?,?,?,?,?,?), ";
                input.push(new Date(i));
                for (var v in all) {input.push(all[v]);}
            }	// How many tasks to add to the query? Add the interval until deadline < the new value.

            query = query.slice(0, -2) + ";";
            if (!input.length) {return res.status(400).send();}
            pool.query(query, input, function(err, result) {
            	if(err)
            		return res.status(500).send();
                pool.query('SELECT todo_id, datetime_deadline, datetime_added, datetime_done, forename, middlename, lastname, todo_text, is_deactivated, color_hex, todo.group_id FROM todo LEFT JOIN home_group USING (group_id) LEFT Join person ON done_by_id = person.person_id WHERE todo_id = ?',
                    [result.insertId], function(err, result){
                        if(err)
                            return res.status(500).send();
                        else if(result.length == 0)
                            return res.status(500).send();
                        socket.group_data('group task', result[0].group_id, result);
                        return res.status(200).send();
                    });
            });
        });
    }
    else {
        // If we want to post a simple task, this happens.
        query += "(?,?,?,?,?,?,?);";
        input = [
            data.datetime_deadline,
            data.group_id,
            data.todo_text,
            (data.datetime_done ? data.datetime_done : null),
            checkRange(req.session.person_id, 1, null),
            (data.done_by_id ? data.done_by_id : null),
            null
        ];
        pool.query(query, input, function(err, result) {
            if(err)
                return res.status(500).send();
            pool.query('SELECT todo_id, datetime_deadline, datetime_added, datetime_done, forename, middlename, lastname, todo_text, is_deactivated, color_hex, todo.group_id FROM todo LEFT JOIN home_group USING (group_id) LEFT Join person ON done_by_id = person.person_id WHERE todo_id = ?',
                [result.insertId], function(err, result){
                    if(err)
                        return res.status(500).send();
                    else if(result.length == 0)
                        return res.status(500).send();
                    socket.group_data('group task', result[0].group_id, result);
                    return res.status(200).send();
                });
        });
    }
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
		(!first) ? (request += ', ') : (first = false);
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
	return [query, inputs];
}

/**
* Check the result, release connection and return.
*/
function checkResult(err, result, res) {
	if (err)
		return res.status(500).send();
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

/**
 * Check for a database connection error and report if connected.
 */
function checkConnectionError(err, res) {
    if(err) {
        res.status(500).json({'Error' : 'connecting to database: ' } + err);
    }
}