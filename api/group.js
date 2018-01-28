/**
 * @module Group API
 */
/*
Authors: A.C., Andreas Hammer (main author), Magnus Eilertsen

    home_group columns:

    group_id INTEGER NOT NULL AUTO_INCREMENT,
    group_name NVARCHAR(50) NOT NULL,
    group_desc NVARCHAR(200),
    group_type INTEGER NOT NULL DEFAULT 0,
    created_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cleaning_list_interval INTEGER NOT NULL DEFAULT 0,
    group_pic MEDIUMBLOB,
    group_pic_tiny  BLOB,
    default_currency_id INTEGER NOT NULL,
    shopping_list_id INTEGER NOT NULL,

 */
var router = require('express').Router(),
    formidable = require('formidable'),
    Jimp = require("jimp");

module.exports = router;

/**
 * Fetch all the different group role types
 *
 * @name Get role types
 * @route {GET} /api/group/roles
 */
router.get('/roles', function(req, res){
    pool.query('SELECT * FROM home_role', function(err, result){
        if(err)
            return res.status(500).send();
        return res.status(200).json(result);
    });
});

/**
 * Check if you have administrator privileges for a group
 *
 * @name Check if you have administrator privileges
 * @route {GET} /api/group/{group_id}/me/privileges
 *
 */
router.get('/:group_id/me/privileges', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query('SELECT role_id FROM group_person WHERE person_id = ? AND group_id = ?', [req.session.person_id, req.params.group_id], function(err, result){
        if(err)
            return res.status(500).send();
        if(result.length > 0) {
            res.status(200).send(result[0].role_id == 2);
        } else {
            res.status(200).send(false);
        }
    });
});

/**
 * Get group members privileges
 *
 * @name Get members privileges
 * @route {GET} /api/group/{group_id}/privileges
 *
 */
router.get('/:group_id/privileges', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query('SELECT * FROM group_person LEFT JOIN home_role USING (role_id) WHERE group_id = ?', [req.params.group_id], function(err, result){
        if(err)
            return res.status(500).send();
        res.status(200).json(result);
    });
});

/**
 * Get all users for a group
 *
 * @name Get all users for a group
 * @route {GET} /api/group/{group_id}/users
 *
 */
router.get('/:group_id/users', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query('SELECT person_id, forename, lastname, email FROM group_person LEFT JOIN person USING (person_id) WHERE group_id = ?', [req.params.group_id], function(err, result){
        console.error(err);
        if(err)
            return res.status(500).send();
        var ret = [];
        for(var i = 0; i < result.length; i++){
            ret.push({
                person_id: result[i].person_id,
                name: result[i].forename + " " + result[i].lastname,
                email: result[i].email
            });
        }
        res.status(200).json(ret);
    });
});

/**
 * Checks if the group name is available
 *
 * @name Check if group name i available
 * @route {GET} /api/group/name
 * @headerparam {string} group_name A groups unique name
 *
 */
router.get('/name', function(req, res){
    if(!req.session.person_id)
        return res.status(403).send("Login required");
    if(!req.query.group_name)
        return res.status(400).send("Bad Request (missing variable 'group_name')");
    pool.query("SELECT COUNT(*) FROM home_group WHERE group_name = ?", [req.query.group_name], function (err, result){
		return (err) ? (res.status(500).send(err.code)) : (res.status(200).send(result[0]["COUNT(*)"] == 0));
	});
});

/**
 * Get the group info for groups the current user inhabit
 *
 * @name Get group info for all groups current user inhabit
 * @route {GET} /api/group/me
 *
 */
router.get('/me', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query('SELECT home_group.*, group_person.invite_accepted FROM home_group LEFT JOIN group_person USING(group_id)  WHERE person_id = ?', [req.session.person_id], function(err, result){
        return (err) ? (res.status(500).send()): (res.status(200).json(result));
    });
});

/**
 * Get the requested group's info
 *
 * @name Get group information
 * @route {GET} /api/group/{group_id}
 *
 */
router.get('/:group_id', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.getConnection(function(err, connection){
        if(err){
            connection.release();
            return res.status(500).send("Error");
        }
        connection.query("SELECT * FROM home_group WHERE group_id = ?;", [req.params.group_id], function(err, result){
            connection.release();
            return (err) ? (res.status(400).send(err.code + "\n" + err.sqlMessage)) : (res.status(200).json(result));
        });
    });
});

/**
 * Get all groups info/get info about group_name
 *
 * @name Get all group information
 * @route {GET} /api/group
 * @headerparam {string} group_name A groups unique name (Optional)
 *
 */
router.get('/', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            return res.status(500).send();
        }
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
 * Add members to the specified group
 *
 * @name Add member to group
 * @route {POST} /api/group/{group_id}/members
 * @bodyparam {array} members[] array containing the ids of the members to add
 *
 */
router.post('/:group_id/members', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send("Person_id");
    if(!req.body['members[]'] && !req.body.members)
        return res.status(400).send("Members");
    if(!(req.body.members instanceof Array)){
        if(!req.body.members) {
            req.body.members = req.body['members[]'];
        }
        delete req.body['members[]'];
        if(!(req.body.members instanceof Array))
            req.body.members = [req.body.members];
        if(!req.body.members || req.body.members.length == 0)
            return res.status(400).send("Bad Request");
        req.body.members = req.body.members[0].split(',');
    }
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            return res.status(500).send(err);
        }
        connection.query("SELECT group_name FROM home_group WHERE group_id = ?", [req.params.group_id], function(err, result) {
            if(err) {
                connection.release();
                return res.status(500).send(err);
            }
            var group = result[0];
            connection.query("SELECT role_id FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.session.person_id], function (err, result) {
                if (err) {
                    console.error(err);
                    connection.release();
                    return res.status(500).send(err);
                }
                if (result.length == 0 || result[0].role_id != 2) {
                    connection.release();
                    return res.status(400).send("You're not the admin");
                }
                var qry = "INSERT INTO group_person (person_id, group_id, was_invited) VALUES (?, ?, ?)";
                var vals = [req.body.members[0], req.params.group_id, 1];
                socket.person_data('invite group', req.body.members[0], group);
                for (var i = 1; i < req.body.members.length; i++) {
                    qry += ", (?, ?, ?)";
                    vals.push(req.body.members[i], req.params.group_id, 1);
                    socket.person_data('invite group', req.body.members[i], group);
                }
                qry += ";";
                connection.beginTransaction(function (err) {

                    if (err) {
                        console.error(err);
                        connection.release();
                        return res.status(500).send();
                    }

                    connection.query(qry, vals, function (err, result) {
                        if (err) {
                            console.error(err);
                            connection.release();
                            return res.status(500).send(err);
                        }
                        connection.commit(function (err) {
                            if (err)
                                return connection.rollback(function (err) {
                                    connection.release();
                                    if (err) {
                                        console.error(err);

                                        res.status(500).send("Transaction fail");
                                    }
                                });
                            connection.release();
                            pool.query('SELECT forename, lastname, person_id FROM person WHERE person_id = ?', [req.body.members[0]], function(err, result){
                                if(err){
                                    console.error(err);
                                    return res.status(500).send();
                                }
                                res.status(200).json(result[0]);
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * "Deletes" (deactivates) a group
 *
 * @name Deactivates group
 * @route {DELETE} /api/group/{group_id}
 * @bodyparam {number} person_id the persons to delete
 *
 *
 */
router.delete('/:group_id/group', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query('UPDATE home_group SET group_deactivated = 1 WHERE group_id IN ' +
        '(SELECT t.group_id FROM (SELECT group_id FROM home_group ' +
        'LEFT JOIN group_person USING (group_id) ' +
        'WHERE person_id = ? AND role_id = 2 AND group_id = ?) t)', [req.session.person_id, req.params.group_id], function(err, result){
        if(err)
            return res.status(500).send();
        if(result.affectedRows == 0)
            return res.status(403).send();
        res.status(200).send();
    });
});

/**
 * Removes a user's access to the group. If no person_id is provided, the logged in user is removed from the group
 *
 * @name Removes user's access to group
 * @route {DELETE} /api/group/{group_id}
 * @bodyparam {number} person_id a persons unique id
 *
 */
router.delete('/:group_id', function(req, res){
    if(!req.params.group_id)
        return res.status(400).send();
    if(req.body.person_id == null || req.body.person_id == req.session.person_id) {
        pool.query("DELETE FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.session.person_id], function(err, result) {
            if(err) return res.status(500).send("Internal database error(3)");
            return res.status(200).send("You have been removed from the group");
        });
    } else {
        pool.getConnection(function (err, connection) {
            if (!checkConnectionError(err, connection, res)) {
                return;
            }
            connection.query("SELECT role_id FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.session.person_id], function (err, result) {
                if (err) {
                    connection.release();
                    return res.status(500).send("Internal database error (1)");
                }
                if(!result[0]["role_id"] || result[0].role_id != 2) {
                    return res.status(403).send("You do not have rights to remove that person");
                }
                connection.query("DELETE FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.body.person_id], function (err, result) {
                    connection.release();
                    if (err)
                        return res.status(500).send("Internal database error (2)");
                    res.status(200).send();
                });
            });
        });
    }
});

/**
 * Change the provided users privileges in the group
 *
 * @name Change users privileges in group
 * @route {PUT} /api/group/{group_id}/userPrivileges
 * @bodyparam {number} person_id the user to change privileges
 * @bodyparam {number} role_id the new role
 *
 */
router.put('/:group_id/userPrivileges', function(req, res){
    if(!req.body.person_id || !req.body.role_id)
        return res.status(400).send();
    pool.getConnection(function(err, connection){
        if (!checkConnectionError(err, connection, res)) {return;}
        connection.query("SELECT person_id FROM group_person WHERE role_id = 2 AND group_id = ?", [req.params.group_id], function(err, result){
            if(err) {
                connection.release();
                return res.status(500).send();
            }
            console.log(result);
            if(result.length == 1 && req.session.person_id == req.body.person_id){
                console.log("length");
                connection.release();
                return res.status(400).send();
            }
            var f = false;
            for(var i = 0; i < result.length; i++){
                if(result[i].person_id == req.session.person_id) {
                    f = true;
                }
            }
            if(!f){
                console.log("found");
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
 * @name Update groups profile picture
 * @route {POST} /api/group/{group_id}/picture
 * @bodyparam {FormData} file new FormData().append('file', $('input#file.findDocumentOnboarding')[0].files[0])
 *
 */
router.post('/:group_id/picture', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

        if (err) {
            return res.status(500).json({'Error': err});
        }

        if (!files.File || !files.File.path)
            return res.status(400).json({'error': 'file error'});

        var path = files.File.path,
            file_size = files.File.size;

        if (file_size > 4000000)
            return res.status(400).json({'error': 'image file over 4MB'});

        Jimp.read(path, function (err, img) {
            if (err) {
                console.log(err);
                res.status(500).json({'Error': err});
                return;
            }

            var img_tiny = img.clone();

            img.background(0xFFFFFFFF)
                .cover(1200, 400)
                .quality(70)
                .getBuffer(Jimp.MIME_JPEG, function (err, data) {
                    if (err) {
                        console.log(err);
                        console.log("error 1");
                        res.status(500).json({'Error': err});
                        return;
                    }
                    img_tiny.cover(128, 128)
                        .quality(60)
                        .getBuffer(Jimp.MIME_JPEG, function (err, data_tiny) {
                            if (err) {
                                console.log("error 2");
                                res.status(500).json({'Error': err});
                                return;
                            }
                            pool.getConnection(function (err, connection) {
                                if (err) {
                                    connection.release();
                                    console.log("error 3");
                                    res.status(500).json({'Error': err});
                                    return;
                                }
                                connection.query("UPDATE home_group SET group_pic = ?, group_pic_tiny = ?, has_group_pic = 1 WHERE group_id = ?;", [data, data_tiny, req.params.group_id], function (err, results, fields) {
                                    connection.release();
                                    if (err) {
                                        console.log("error 4");
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
 * @name Return groups picture
 * @route {POST} /api/group/{group_id}/picture
 *
 */
router.get('/:group_id/picture', function(req, res){
    pool.query("SELECT group_pic, has_group_pic FROM home_group WHERE group_id = ?;", [req.params.group_id], function (err, results, fields) {
        if(err)
            return res.status(500).json({'Error' :err });

        if(!results[0].has_group_pic)
            return res.status(404).json({error: 'no group picture.'});

        res.contentType('jpeg').status(200).end(results[0].group_pic, 'binary');
    });
});

/**
 * Get tiny group picture
 *
 * @name Get tiny group picture
 * @route {GET} /api/group/{group_id}/picture_tiny
 *
 */
router.get('/:group_id/picture_tiny', function(req, res){
    pool.getConnection(function (err, connection) {
        if (!checkConnectionError(err, connection, res)) {return;}
		
        connection.query("SELECT group_pic_tiny, has_group_pic  FROM person WHERE person_id = ?;", [req.params.person_id], function (error, results, fields) {
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);

            if(!results[0].has_group_pic)
                return res.status(404).json({error: 'no group picture.'});

            res.contentType('jpeg').status(200).end(results[0].group_pic_tiny, 'binary');
        });
    });
});

/**
 * Remove the image for a group.
 *
 * @name Remove image for group
 * @route {DELETE} /api/group/{group_id}/picture
 *
 */
router.delete('/:group_id/picture', function(req, res){

    pool.getConnection(function (err, connection) {
        if (!checkConnectionError(err, connection, res)) {return;}

        connection.query("UPDATE home_group SET group_pic = NULL, group_pic_tiny = NULL, has_group_pic = 0 WHERE group_id = ?;", [data, data_tiny, req.params.person_id], function (err, results, fields) {
            connection.release();
            if (err)
                return res.status(500).json({'Error': err});
			res.status(200).json(results);
        });
    });
});

/**
 * Accept invitation to group
 *
 * @name Accept invitation to group
 * @route {POST} /api/group/{group_id}/invite
 *
 */
router.post('/:group_id/invite', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query('UPDATE group_person SET invite_accepted = 1, joined_timestamp = CURRENT_TIMESTAMP WHERE person_id = ? AND group_id = ?',
        [req.session.person_id, req.params.group_id], function(err, result){
            if(err)
                return res.status(500).send();
            res.status(200).send();
        });
});

/**
 * Decline invitation to group
 *
 * @name Decline invitation to group
 * @route {DELETE} /api/group/{group_id}/invite
 *
 */
router.delete('/:group_id/invite', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query('DELETE FROM group_person WHERE invite_accepted = 0 AND person_id = ? AND group_id = ?',
        [req.session.person_id, req.params.group_id], function(err, result){
            if(err)
                return res.status(500).send();
            res.status(200).send();
        });
});

/**
 * The GET request for getting the task details for all tasks in this group.
 *
 * @name Getting task details for tasks in group
 * @route {GET} /api/group/{group_id}/todo
 *
*/
router.get('/:group_id/todo', function(req, res) {
    pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		connection.query('SELECT * FROM todo LEFT JOIN todo_person USING(todo_id) WHERE group_id = ?',
			[req.params.group_id],
			function(err, result) {
				connection.release();
				if (err)
					return res.status(500).send();
				if (result) {
					var people = [];
					for (i = 0; i < result.length; i++) {people.push({"person_id":result[i].person_id});}
					var values = {};
					for (var p in result[0]) {values[p] = result[0][p];}
					delete values.person_id;
					values.people = people;
					res.status(200).json(values);
				}
			}
		);
	});
});

/**
 * Update the group info
 *
 * @name Update group information
 * @route {PUT}  /api/group/{group_id}
 * @bodyparam {SQL} sql all table attributes with new data
 *
 */
router.put('/:group_id', function(req, res){
    var acceptedGroupVars= [
        'group_name',
        'group_desc',
        'group_type',
        'group_default_currency_id'
    ];
    if(!req.session.person_id)
        return res.status(500).send();
    pool.query("SELECT role_id FROM group_person WHERE group_id = ? AND person_id = ?", [req.params.group_id, req.session.person_id], function(err, result) {
        if(err) {
            console.log(err);
            return res.status(500).send(err);
        }
        if(result.length == 0 || result[0].role_id != 2) {
            console.log("heihei");
            return res.status(400).send();
        }
        var qry = "UPDATE home_group SET ";
        var f = true;
        var vals = [];
        for (var p in req.body) {
            if(acceptedGroupVars.indexOf(p) < 0)
                return res.status(400).send("Bad request (bad variable: '" + p + "')");
            if (!f)
                qry += ", ";
            qry += p + " = ?";
            f = false;
            vals.push(req.body[p]);
        }
        vals.push(req.params.group_id);
        qry += " WHERE group_id = ?";
        pool.query(qry, vals, function (err, result) {
            return (err) ? (res.status(500).send(err.code + "\n" + err.sqlMessage)) : (res.status(200).json(result));
        });
    });
});

/**
 * Create a new group
 *
 * @name Create new group
 * @route {POST} /api/group
 * @bodyparam {string} group_name the new groups name
 * @bodyparam {string} currency the new groups chosen currency
 *
 */
router.post('/', function(req, res){
    var acceptedGroupVars = ["group_name", "currency"];
    for(var p in req.body) {
        if(acceptedGroupVars.indexOf(p) < 0) return res.status(400).send("Bad variable: " + p);
    }
    if(!req.body.group_name) return res.status(400).send("Missing variable: group_name");
    if(!req.body.currency) return res.status(400).send("Missing variable: currency");
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
                return res.status(400).send("Bad request (group name in use)");
            }
            connection.beginTransaction(function(err) {
                if(err) {
                    connection.release();
                    return res.status(500).send();
                }
                connection.query("INSERT INTO shopping_list (currency_id) VALUES (?)", [req.body.currency], function(err, result) {
                    if(err) {
                        connection.release();
                        return res.status(500).send("Failed to insert shopping_list entry");
                    }
                    qry = "INSERT INTO home_group (shopping_list_id, default_currency_id, group_name) VALUES (?,?,?)";
                    var values = [result.insertId, req.body.currency, req.body.group_name];
                    connection.query(qry, values, function (err, result) {
                        if(err) {
                            connection.release();
                            return res.status(500).send("Failed to insert home_group entry");
                        }
                        var group_id = result.insertId;
                        connection.query('INSERT INTO group_person (person_id, group_id, role_id, invite_accepted) VALUES (?, ?, ?, ?)', [req.session.person_id, group_id, 2, 1], function(err, result) {
                            if(err) {
                                connection.release();
                                console.log(err);
                                return res.status(500).send("Failed to add session user to group");
                            }
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function (err) {
                                        connection.release();
                                        if (err) console.error(err);
                                        res.status(500).send("Transaction fail");
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
