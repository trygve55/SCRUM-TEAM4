var router = require('express').Router();

module.exports = router;

/**
 * Registers a new shopping list on current user
 *
 * URL: /api/tasks/private/
 * method: POST
 */

router.post('/', function (req, res) {
    var p_id = req.session.person_id;
    pool.query('INSERT INTO private_todo_list (person_id) VALUES(?)', [p_id], function(err, result) {
        if (err)
            return res.status(500).json({error: err});
        return res.status(200).json({private_todo_list_id: result.insertId});
    });
});

/**
 * Registers a new shopping list entry only if correct person_id exists
 *
 * URL: /api/tasks/private/entry
 * method: POST
 * data: {
 *      private_todo_list_id
 *      todo_text
 * }
 */

router.post('/entry', function (req, res) {
    var data = req.body, p_id = req.session.person_id;

    if (!data.private_todo_list_id || !data.todo_text)
        return res.status(400).send("body error");

    pool.query('INSERT INTO `private_todo_entry` (`private_todo_list_id`, `todo_text`) ' +
        'SELECT DISTINCT ?, ? ' +
        'FROM `private_todo_list` ' +
        'WHERE `person_id` = ? AND private_todo_list_id = ?;',
        [data.private_todo_list_id, data.todo_text, p_id, data.private_todo_list_id], function (err, result) {
            if(err)
                return res.status(500).json({error: err});
            else if (result.affectedRows === 0)
                return res.status(400).json({error: "No access/does not exist"});
            return res.status(200).json({success:"added entry", private_todo_list_id: result.insertId})
        });
});

/**
 *  Gets all shopping lists and entries based on current user
 *
 *  URL: /api/tasks/private/
 *  method: GET
 *
 */

router.get('/', function(req, res) {
    var p_id = req.session.person_id;
    pool.query('SELECT * FROM private_todo_list ' +
        'LEFT JOIN private_todo_entry ' +
        'USING(private_todo_list_id) ' +
        'WHERE person_id = ?;',[p_id], function (err, result) {
        if(err)
            return res.status(500).json({error: err});
        if(!result.length)
            return res.status(400).json({error: "the data requested does not exist"});

        var private_todo_lists = [];

        for (var i = 0; i < result.length; i++) {
            var current_private_todo_list = existsInArray(result[i].private_todo_list_id, private_todo_lists);
            if (current_private_todo_list == -1) {
                private_todo_lists.push({
                    "private_todo_list_id": result[i].private_todo_list_id,
                    "private_todo_list_name": result[i].private_todo_list_name,
                    "is_deactivated": result[i].is_deactivated,
                    "color_hex": result[i].color_hex,
                    "private_todo_entries": []
                });
                current_private_todo_list = private_todo_lists.length - 1;
            }
            if(result[i].private_todo_entry_id) private_todo_lists[current_private_todo_list].private_todo_entries.push({
                "private_todo_entry_id":result[i].private_todo_entry_id,
                "todo_text":result[i].todo_text,
                "datetime_deadline":result[i].datetime_deadline,
                "datetime_added":result[i].datetime_added,
                "datetime_done":result[i].datetime_done
            });
        }
        for (i = 0; i < private_todo_lists.length; i++) {
            private_todo_lists[i].private_todo_entries = removeDuplicates(private_todo_lists[i].private_todo_entries);
        }
        return res.status(200).json(private_todo_lists);
    });
});

/**
 *  Get specific todo_list based on current user and list_id
 *
 *  URL: /api/tasks/private/{private_todo_list_id}
 *  method: GET
 *
 */

router.get('/:private_todo_list_id', function(req, res) {
    var p_id = req.session.person_id;

    pool.query('SELECT * FROM private_todo_list ' +
        'LEFT JOIN private_todo_entry ' +
        'USING(private_todo_list_id) ' +
        'WHERE person_id = ? AND private_todo_list_id = ?;',
        [p_id, req.params.private_todo_list_id], function (err, result) {
        if(err)
            return res.status(500).json({error: err});
        if(!result.length)
            return res.status(403).json({error: "the data requested does not exist"});

        var entries = [];
        for (var i = 0; i < result.length; i++) {
            if(result[i].private_todo_entry_id) entries.push({
                "private_todo_entry_id":result[i].private_todo_entry_id,
                "todo_text":result[i].todo_text,
                "datetime_deadline":result[i].datetime_deadline,
                "datetime_added":result[i].datetime_added,
                "datetime_done":result[i].datetime_done
            });
        }
        res.status(200).json({
            "private_todo_list_id": result[0].private_todo_list_id,
            "private_todo_list_name": result[0].private_todo_list_name,
            "is_deactivated": result[0].is_deactivated,
            "color_hex": result[0].color_hex,
            "private_todo_entries": removeDuplicates(entries)
        })
    });
});


/**
 * Update shopping list
 *
 * URL: /api/tasks/private/entry/{private_todo_entry}
 * method: PUT
 * data {
 *  [private_list_name]
 *  [is_deactivated]
 *  [color_hex]
 * }
 */


router.put('/list/:private_todo_list_id', function(req, res){
    if(!req.params.private_todo_list_id)
        return res.status(400).json({error: "no todo_list_id"});

    var data = req.body;

    if (data.private_todo_list_id || data.person_id)
        return res.status(400).json({error: "Invalid request, check documentation for valid parameters"});

    if (data.is_deactivated === "true") data.is_deactivated = true;
    if (data.is_deactivated === "false") data.is_deactivated = false;

    var request = putRequestSetup(req.params.private_todo_list_id, req, "private_todo_list");
    pool.query(request[0], request[1], function(err, result) {
        if (err) return res.status(500).json({error: err});
        checkResult(err, result, res);
    });
});


/**
 * Update a task
 *
 * URL: /api/tasks/{todo_id}
 * method: PUT
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
 * Update shopping list entry
 *
 * URL: /api/tasks/private/entry/{private_todo_entry}
 * method: PUT
 * data {
 *  [todo_text]
 *  [datetime_deadline]
 *  [datetime_done]
 * }
 */


router.put('/entry/:private_todo_entry', function(req, res) {
    if(!req.params.private_todo_entry)
        return res.status(400).send();

    var data = req.body;
    if(data.private_todo_entry_id || data.private_todo_list_id)
        return res.status(400).json({error: "Invalid request, check documentation for valid parameters"});

    var query = putRequestEntry(req.params.private_todo_entry, req, "private_todo_entry");
    pool.query(query[0], query[1], function(err, result) {
        if (err) return res.status(500).json({error: err});
        checkResult(err, result, res);
    });
});


/**
 * Delete shopping list
 *
 * URL: /api/tasks/private/entry/{private_todo_entry_id}
 * method: DELETE
 */

router.delete('/entry/:private_todo_entry_id', function(req, res) {
    var p_id = req.session.person_id;
    pool.query('DELETE FROM `private_todo_entry`' +
        'WHERE `private_todo_entry_id` = ? ' +
        'AND `private_todo_list_id` IN ' +
        '(SELECT `private_todo_list_id` ' +
        'FROM `private_todo_list` ' +
        'WHERE `person_id` = ?) LIMIT 1;',
        [req.params.private_todo_entry_id, p_id], function(err, result) {
            checkResult(err, result, res);
        });
});

/**
 * Make sure the array only contains unique elements.
 */

function removeDuplicates(arr) {
    var added_ids = [], unique_array = arr.filter(function(elem, index, self) {
        if (elem.person_id) {
            if (added_ids.indexOf(elem.person_id) == -1) {
                added_ids.push(elem.person_id);
                return true;
            } else { return false; }
        } else if (!elem.shopping_list_entry_id && elem.shopping_list_id) {
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
    return unique_array;
}

function putRequestEntry(id, req, tableName) {
    var parameters = [], request = 'UPDATE ' + tableName + ' SET ', first = true;
    for (var k in req.body) {
            (!first) ? request += ', ' :  first = false;
            request += k + ' = ?';
            parameters.push(req.body[k]);
    }
    request += ' WHERE ' + tableName + '_id = ? ' +
        'AND private_todo_list_id IN (SELECT private_todo_list_id FROM private_todo_list WHERE person_id = ?);';
    parameters.push(id);
    parameters.push(req.session.person_id);
    return [request, parameters];
}

function putRequestSetup(iD, req, tableName) {
    if(!iD) {
        return res.status(400).json({'Error' : (tableName + '_id not specified: ') } + err);
    }
    var parameters = [], request = 'UPDATE ' + tableName + ' SET ';
    var first = true;
    for (var k in req.body) {
        (!first) ? (request += ', ') : (first = false);
        request += k + ' = ?';
        parameters.push(req.body[k]);
    }
    request += ' WHERE ' + tableName + '_id = ? ' +
        'AND person_id = ?';
    parameters.push(iD);
    parameters.push(req.session.person_id);
    return [request, parameters];
}

/**
 * Find the index of this in this JSON array, if it exists. -1 otherwise.
 */

function existsInArray(private_todo_list_id, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].private_todo_list_id == private_todo_list_id) return i;
    }
    return -1;
}

/**
 * Check the result, release connection and return.
 */
function checkResult(err, result, res) {
    if (err) {
        res.status(500).json({error: err});
    } else if (result.affectedRows == 0) {
        res.status(403).json({error: "No access or does not exists"})
    } else {
        res.status(200).json({success: "Success"});
    }
}
