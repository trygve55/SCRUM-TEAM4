var router = require('express').Router(),
    formidable = require('formidable'),
    Jimp = require("jimp");

module.exports = router;

router.get('/name', function(req, res){
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

router.post('/', function(req, res){
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
                    if(err)
                        return res.status(500).send();
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
                        if(err)
                            return res.status(500).send();
                        var group_id = result.insertId;
                        connection.query('INSERT INTO group_person (person_id, group_id, role_id, invite_accepted) VALUES (?, ?, ?, ?)', [req.session.person_id, result.insertId, 2, 1], function(err, result) {
                            if(err)
                                return res.status(500).send();
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function (err) {
                                        if (err)
                                            console.error(err);
                                        res.status(500).send();
                                    });
                                }
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

router.get('/me', function(req, res){
    if(!req.session.person_id)
        return res.status(500).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send();
        connection.query('SELECT * FROM home_group WHERE group_id IN (SELECT group_id FROM group_person WHERE person_id = ?)', [req.session.person_id], function(err, result){
            if(err)
                return res.status(500).send();
            res.status(200).json(result);
        });
    });
});

router.get('/', function(req, res){
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        var qry = "";
        if(!req.query.group_name && !req.query.group_id)
            qry = "SELECT * FROM home_group;";
        else
            qry = "SELECT * FROM home_group WHERE " + (req.query.group_name ? "group_name" : "group_id") + " = ?;";
        console.log(qry);
        connection.query(qry, [req.query.group_name || req.query.group_id], function(err, result){
            if(err){
                connection.release();
                return res.status(400).send(err.code + "\n" + err.sqlMessage);
            }
            res.status(200).json(result);
        });
    });
});

router.put('/', function(req, res){
    if(!req.body.group_id)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        var qry = "UPDATE home_group SET ";
        var f = true;
        var vals = [];
        for(var p in req.body){
            if(req.body.hasOwnProperty(p)){
                if(p == "group_id")
                    continue;
                if(!f)
                    qry += ", ";
                qry += p + " = ?";
                f = false;
                vals.push(req.body[p]);
            }
        }
        vals.push(req.body.group_id);
        qry += " WHERE group_name = ?";
        connection.query(qry, vals, function(err, result){
            connection.release();
            if(err)
                return res.status(400).send(err.code + "\n" + err.sqlMessage);
            return res.status(200).json(result);
        });
    });
});

router.post('/members', function(req, res){
    req.body.members = req.body['members[]'];
    delete req.body['members[]'];
    console.log(req.body);
    if(!req.body.members || !req.body.group_id || req.body.members.length == 0)
        return res.status(400).send("Bad Request");
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        var qry = "INSERT INTO group_person (person_id, group_id) VALUES (?, ?)";
        var vals = [req.body.members[0], req.body.group_id];
        for(var i = 1; i < req.body.members.length; i++){
            qry += ", (?, ?)";
            vals.push(req.body.members[i], req.body.group_id);
        }
        console.log(vals);
        qry += ";";
        console.log(qry);
        connection.beginTransaction(function(err) {
            if(err)
                return res.status(500).send();
            connection.query(qry, vals, function (err, result) {
                console.error(err);
                if (err)
                    return res.status(500).send(err.code);
                connection.commit(function(err){
                    if(err)
                        return connection.rollback(function(err){
                            if(err)
                                console.error(err);
                            res.status(500).send();
                        });
                    res.status(200).json(result);
                });
            });
        });
    });
});

router.delete('/user', function(req, res){
    if(!req.body.person_id || !req.body.group_id || !req.body.role_id)
        return res.status(400).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        connection.query("DELETE FROM group_person WHERE group_id = 1 AND person_id = 1", [req.body.group_id, req.body.person_id], function(err, result){
            connection.release();
            if(err)
                return res.status(500).send();
            res.status(200).send();
        });
    });
});

router.put('/userPrivileges', function(req, res){
    if(!req.body.person_id || !req.body.group_id || !req.body.role_id)
        return res.status(400).send();
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Internal Error");
        connection.query("SELECT COUNT(*) FROM home_group WHERE group_id = ?", [req.body.group_id], function(err, result){
            if(err) {
                connection.release();
                return res.status(500).send();
            }
            else if(result[0]["COUNT(*)"] == 0){
                connection.release();
                return res.status(400).send();
            }
            connection.query("SELECT COUNT(*) FROM person WHERE person_id = ?", [req.body.person_id], function(err, result){
                if(err) {
                    connection.release();
                    return res.status(500).send();
                }
                else if(result[0]["COUNT(*)"] == 0){
                    connection.release();
                    return res.status(400).send();
                }
                connection.query("UPDATE group_person SET role_id = ? WHERE group_id = ? AND person_ID = ?", [req.body.role_id, req.body.group_id, req.body.person_id], function(err, result){
                    connection.release();
                    if(err)
                        return res.status(500).send();
                    res.status(200).json(result);
                });
            });
        });
    });
});

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
            console.log("Processing image");

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

                                console.log("Uploading image");

                                connection.query("UPDATE home_group SET group_pic = ?, group_pic_tiny = ? WHERE group_id = ?;", [data, data_tiny, req.params.group_id], function (err, results, fields) {
                                    connection.release();
                                    if (err) {
                                        res.status(500).json({'Error': err});
                                        return;
                                    }
                                    console.log("Uploading image complete");


                                    res.status(200).json(results);
                                });
                            });
                        });
                });
        });
    });
});

router.get('/:group_id/picture', function(req, res){
    console.log('GET-request established');

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

router.get('/:group_id/picture_tiny', function(req, res){
    console.log('GET-request established');

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
* Required parameters: todo_id(URL).
*/
router.get('/:group_id', function(req, res) {
console.log('GET-request established');
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
	console.log('Database connection established');
	return true;
}
