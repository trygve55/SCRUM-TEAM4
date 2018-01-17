var router = require('express').Router(),
    formidable = require('formidable'),
    Jimp = require("jimp");

module.exports = router;

/**
 * Checks if the group name is already taken
 *
 * URL: /api/group/name
 * method: GET
 * data: {
 *      group_name
 * }
 */
router.get('/name', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    if(!req.query.group_name)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        connection.query("SELECT COUNT(*) FROM home_group WHERE group_name = ?", [req.query.group_name], function (err, result){
            connection.release();
            if(err)
                return res.status(500).send(err.code);
            res.status(200).send(result[0]["COUNT(*)"] == 0);
        });
    });
});

/**
 * Create a new group
 *
 * URL: /api/group
 * method: POST
 * data: {
 *      group_name,
 *      currency
 * }
 */
router.post('/', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    if(!req.body.group_name)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send(JSON.stringify(err));
        var qry = "SELECT group_id FROM home_group WHERE group_name = ?";
        connection.query(qry, [req.body.group_name], function(err, result){
            if(err) {
                connection.release();
                return res.status(500).send(err.code);
            }
            if(result.length > 0) {
                connection.release();
                return res.status(200).send(false);
            }
            connection.beginTransaction(function(err) {
                if(err)
                    return res.status(500).send();
                connection.query("INSERT INTO shopping_list (currency_id) VALUES (?)", [req.body.currency], function(err, result) {
                    if(err) {
                        connection.release();
                        return res.status(500).send();
                    }
                    qry = "INSERT INTO home_group (shopping_list_id, default_currency_id";
                    var values = [result.insertId, req.body.currency];
                    delete req.body.currency;
                    var group = req.body;
                    for (var p in group) {
                        if (values.length != 0)
                            qry += ", ";
                        qry += p;
                        values.push(group[p]);
                    }
                    if (values.length == 0) {
                        connection.release();
                        return res.status(500).send("No values found");
                    }
                    qry += ") VALUES (?";
                    for (var i = 0; i < values.length - 1; i++) {
                        qry += ", ?";
                    }
                    qry += ");";
                    connection.query(qry, values, function (err, result) {
                        if(err) {
                            connection.release();
                            return res.status(500).send();
                        }
                        var group_id = result.insertId;
                        connection.query('INSERT INTO group_person (person_id, group_id, role_id, invite_accepted) VALUES (?, ?, ?, ?)', [req.session.person_id, result.insertId, 2, 1], function(err, result) {
                            if(err) {
                                connection.release();
                                return res.status(500).send();
                            }
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function (err) {
                                        if (err)
                                            console.error(err);
                                        res.status(500).send();
                                    });
                                }
                                connection.release();
                                res.status(200).json({
                                    id: group_id
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * Get the group info for groups the current user inhabit
 *
 * URL: /api/group/me
 * method: GET
 */
router.get('/me', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send();
        connection.query('SELECT * FROM home_group WHERE group_id IN (SELECT group_id FROM group_person WHERE person_id = ?)', [req.session.person_id], function(err, result){
            connection.release();
            if(err)
                return res.status(500).send();
            res.status(200).json(result);
        });
    });
});

/**
 * Get the requested groups info
 *
 * URL: /api/group/{group_id}
 * method: GET
 */

router.get('/:group_id', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        connection.query("SELECT * FROM home_group WHERE group_id = ?;", [req.params.group_id], function(err, result){
            connection.release();
            if(err){
                return res.status(400).send(err.code + "\n" + err.sqlMessage);
            }
            res.status(200).json(result);
        });
    });
});

/**
 * Get all groups info/get info about group_name
 *
 * URL: /api/group/
 * method: GET
 * data: {
 *      group_name - Optional
 * }
 */
router.get('/', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send();
        connection.query("SELECT " + (req.query.group_name ? "*" : "group_id, group_name") + " FROM home_group" + (req.query.group_name ? " WHERE group_name = ?" : "") + ";", [req.query.group_name || req.query.group_id], function(err, result){
            connection.release();
            if(err){
                return res.status(400).send(err.code + "\n" + err.sqlMessage);
            }
            res.status(200).json(result);
        });
    });
});

/**
 * Update the group info
 *
 * URL: /api/group/{group_id}
 * method: PUT
 * data: {
 *      The SQL table attributes with the new data
 * }
 */
router.put('/:group_id', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        connection.query("SELECT role_id FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.session.person_id], function(err, result) {
            if(err) {
                connection.release();
                return res.status(500).send();
            }
            if(result.length == 0 || result[0].role_id != 2) {
                connection.release();
                return res.status(400).send();
            }
            var qry = "UPDATE home_group SET ";
            var f = true;
            var vals = [];
            for (var p in req.body) {
                if (req.body.hasOwnProperty(p)) {
                    if (!f)
                        qry += ", ";
                    qry += p + " = ?";
                    f = false;
                    vals.push(req.body[p]);
                }
            }
            vals.push(req.params.group_id);
            qry += " WHERE group_name = ?";
            connection.query(qry, vals, function (err, result) {
                connection.release();
                if (err)
                    return res.status(400).send(err.code + "\n" + err.sqlMessage);
                return res.status(200).json(result);
            });
        });
    });
});

/**
 * Add members to the specified group
 *
 * URL: /api/group/{group_id}/members
 * method: POST
 * data: {
 *      members: [] containing the ids of the members to add
 * }
 */
router.post('/:group_id/members', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send("Person_id");
    req.body.members = req.body['members[]'];
    delete req.body['members[]'];
    if(!req.body.members || req.body.members.length == 0)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        connection.query("SELECT role_id FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.session.person_id], function(err, result) {
            if(err) {
                connection.release();
                return res.status(500).send(err);
            }
            if(result.length == 0 || result[0].role_id != 2) {
                connection.release();
                return res.status(400).send("You not admin");
            }
            var qry = "INSERT INTO group_person (person_id, group_id) VALUES (?, ?)";
            var vals = [req.body.members[0], req.params.group_id];
            for (var i = 1; i < req.body.members.length; i++) {
                qry += ", (?, ?)";
                vals.push(req.body.members[i], req.params.group_id);
            }
            qry += ";";
            connection.beginTransaction(function (err) {
                if (err)
                    return res.status(500).send("Transaction");
                connection.query(qry, vals, function (err, result) {
                    console.error(err);
                    if (err)
                        return res.status(500).send(err.code);
                    connection.commit(function (err) {
                        if (err)
                            return connection.rollback(function (err) {
                                if (err)
                                    console.error(err);
                                res.status(500).send(err);
                            });
                        res.status(200).json(result);
                    });
                });
            });
        });
    });
});

/**
 * Removes a users access to the group
 *
 * URL: /api/group/{group_id}/user
 * method: DELETE
 * data: {
 *      person_id, person to be updated
 *      role_id new role for person
 * }
 */
router.delete('/:group_id/user', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    if(!req.body.person_id || !req.body.role_id)
        return res.status(400).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        connection.query("SELECT role_id FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.session.person_id], function(err, result) {
            if(err) {
                connection.release();
                return res.status(500).send();
            }
            if(req.body.person_id != req.session.person_id || (result.length == 0 || result[0].role_id != 2)) {
                connection.release();
                return res.status(400).send();
            }
            connection.query("SELECT role_id FROM group_person WHERE group_id = ?", [req.params.group_id], function(err, result) {
                if(err){
                    connection.release();
                    return res.status(500).send();
                }
                if(result.length <= 1){
                    connection.release();
                    return res.status(400).send();
                }
                connection.query("DELETE FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.body.person_id], function (err, result) {
                    connection.release();
                    if (err)
                        return res.status(500).send();
                    res.status(200).send();
                });
            });
        });
    });
});

/**
 * Change the provided users privileges in the group
 *
 * URL: /api/group/{group_id}/userPrivileges
 * method: PUT
 * data: {
 *      person_id, the user to change privileges for
 *      role_id new role
 * }
 */
router.put('/:group_id/userPrivileges', function(req, res){
    if(!req.body.person_id || !req.body.role_id)
        return res.status(400).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        connection.query("SELECT role_id FROM group_person WHERE person_id = ? AND group_id = ?", [req.session.person_id, req.params.group_id], function(err, result){
            if(err) {
                connection.release();
                return res.status(500).send();
            }
            else if(result.length == 0 || result[0].role_id != 2){
                connection.release();
                return res.status(400).send();
            }
            connection.query("UPDATE group_person SET role_id = ? WHERE group_id = ? AND person_ID = ?", [req.body.role_id, req.params.group_id, req.body.person_id], function(err, result){
                connection.release();
                if(err)
                    return res.status(500).send();
                res.status(200).json(result);
            });
        });
    });
});

/**
 * Update the groups profile picture
 *
 * URL: /api/group/{group_id}/picture
 * method: POST
 * data: new FormData().append('file', $('input#file.findDocumentOnboarding')[0].files[0])
 */
router.post('/:group_id/picture', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

        var path = files.file.path,
            file_size = files.file.size;

        if (file_size > 4000000) {
            res.status(400).json({'error': 'image file over 4MB'});
            return;
        }
        Jimp.read(path, function (err, img) {
            if (err) {
                res.status(500).json({'Error': err});
                return;
            }

            var img_tiny = img.clone();

            img.background(0xFFFFFFFF)
                .cover(1200, 400)
                .quality(70)
                .getBuffer(Jimp.MIME_JPEG, function (err, data) {
                    if (err) {
                        res.status(500).json({'Error': err});
                        return;
                    }
                    img_tiny.cover(128, 128)
                        .quality(60)
                        .getBuffer(Jimp.MIME_JPEG, function (err, data_tiny) {
                            if (err) {
                                res.status(500).json({'Error': err});
                                return;
                            }
                            pool.getConnection(function (err, connection) {
                                if (err) {
                                    res.status(500).json({'Error': err});
                                    return;
                                }
                                connection.query("UPDATE home_group SET group_pic = ?, group_pic_tiny = ? WHERE group_id = ?;", [data, data_tiny, req.params.group_id], function (err, results, fields) {
                                    connection.release();
                                    if (err) {
                                        res.status(500).json({'Error': err});
                                        return;
                                    }
                                    res.status(200).json(results);
                                });
                            });
                        });
                });
        });
    });
});

/**
 * Return the groups picture
 *
 * URL: /api/group/{group_id}/picture
 * method: POST
 */
router.get('/:group_id/picture', function(req, res){
    pool.getConnection(function (err, connection) {
        connection.query("SELECT group_pic FROM home_group WHERE group_id = ?;", [req.params.group_id], function (error, results, fields) {
            connection.release();
            if(err) {
                res.status(500).json({'Error' : 'connecting to database: ' } + err);
                return;
            }

            if(results.length == 0) {
                res.status(404).json({error: 'no profile picture.'});
                return;
            }

            if(results) res.contentType('jpeg').status(200).end(results[0].group_pic, 'binary');
        });
    });
});

/**
 * Get tiny group picture
 *
 * URL: /api/group/{group_id}/picture_tiny
 * method: GET
 */
router.get('/:group_id/picture_tiny', function(req, res){
    pool.getConnection(function (err, connection) {
        connection.query("SELECT group_pic_tiny FROM home_group WHERE group_id = ?;", [req.params.group_id], function (error, results, fields) {
            connection.release();
            if(err) {
                res.status(500).json({'Error' : 'connecting to database: ' } + err);
                return;
            }

            if(results.length == 0) {
                res.status(404).json({error: 'no profile picture.'});
                return;
            }

            if(results) res.contentType('jpeg').status(200).end(results[0].group_pic_tiny, 'binary');
        });
    });
});

/**
 * The GET request for getting the task details for all tasks in this group.
 *
 * URL: /api/group/{group_id}/todo
 * method: GET
*/
router.get('/:group_id/todo', function(req, res) {
    pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		connection.query('SELECT * FROM todo LEFT JOIN todo_person USING(todo_id) WHERE group_id = ?',
			[req.params.group_id],
			function(err, result) {
				connection.release();
				if (err) {throw err;}
				if (result) {
					var people = [];
					for (i = 0; i < result.length; i++) {people.push({"person_id":result[i].person_id});}
					var values = {};
					for (var p in result[0]) {values[p] = result[0][p];}
					delete values.person_id;
					values.people = people;
					res.json(values);
				}
			}
		);
	});
});

/**
* Check for a database connection error and report if connected.
*/
function checkConnectionError(err, connection, res) {
	if(err) {
		connection.release();
		res.status(500);
		res.json({'Error' : 'connecting to database: ' } + err);
		return false;
	}

	return true;
}
