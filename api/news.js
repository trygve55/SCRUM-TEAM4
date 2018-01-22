var router = require('express').Router();

module.exports = router;

/**
 * Add new post to the group.
 *
 * URL: /api/news
 * method: POST
 * data: {
 *      group_id,
 *      post_text
 *
 *      Optional:
 *      attachment_type,
 *      attachment_data
 * }
*/
router.post('/', function(req, res) {
	var data = req.body;
	if(!data.group_id || !data.post_text)
		return res.status(400).send();
	var extraData = null;
	if (data.attachment_data)
		extraData = data.attachment_data;
	if(!data.attachment_type)
		data.attachment_type = 0;
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}
		connection.query(
			'INSERT INTO newsfeed_post (' +
			'group_id, posted_by_id, post_text, attachment_type, attachment_data' +
			') VALUES (?,?,?,?,?);',
			[data.group_id, req.session.person_id, data.post_text, data.attachment_type, extraData],	// data.posted_by_id to test this.
			function(err, result) {
				checkResult(err, result, connection, res);
			}
		);
	});
});

/**
 * Get the posts for a group.
 *
 * URL: /api/news/{group_id}
 * method: GET
*/
router.get('/:group_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		connection.query('SELECT ' +
			'post_id, posted_by_id, post_text, attachment_type, posted_datetime, ' +
			'forename, middlename, lastname ' +
			'FROM newsfeed_post ' +
			'LEFT JOIN person ON person.person_id = newsfeed_post.posted_by_id ' +
			'WHERE group_id = ? ORDER BY posted_datetime DESC',
			[req.params.group_id], function(err, result) {
				connection.release();
				if (err)
					return res.status(500).json({error: err});
				var posts = [];
				console.log(result);
				for(var i = 0; i < result.length;i++) {
					posts.push({
						"post_id": result[i].post_id,
						"post_text": result[i].post_text,
						"posted_datetime": result[i].posted_datetime,
						"attachment_type": result[i].attachment_type,
						"posted_by": {
							"person_id": result[i].posted_by_id,
							"forename": result[i].forename,
							"middlename": result[i].middlename,
							"lastname": result[i].lastname
						}
					});
				}

				res.status(200).json(posts);
			}
		);
	});
});

/**
 * Get the posts for a user.
 *
 * URL: /api/news/
 * method: GET
*/
router.get('/', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		connection.query('SELECT post_id, post_text, attachment_type, posted_datetime, person.forename, person.middlename, person.lastname, home_group.group_name, person.person_id FROM newsfeed_post LEFT JOIN person ON (person.person_id = newsfeed_post.posted_by_id) LEFT JOIN home_group USING (group_id) WHERE person_id = ? AND group_id IN (SELECT group_id FROM group_person WHERE person_id = ?) ORDER BY posted_datetime DESC;',
			[req.session.person_id, req.session.person_id], function(err, result) {	//req.params.person_id
				connection.release();
				if (err) {return res.status(500).send();}
				res.status(200).json(result);
			}
		);
	});
});

/**
 * Update a post.
 *
 * URL: /api/news/{post_id}
 * method: PUT
 * data: {
 *      sql attribute style parameters to set value
 * }
*/
router.put('/:post_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}

		var query = putRequestSetup(req.params.post_id, req.body, connection, "newsfeed_post", "post");
		connection.query(
			query[0], query[1],
			function(err, result) {checkResult(err, result, connection, res);}
		);
	});
});

/**
 * Delete this post.
 *
 * URL: /api/news/{post_id}
 * method: DELETE
*/
router.delete('/:post_id', function(req, res) {
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}
		
		connection.query('DELETE FROM newsfeed_post WHERE post_id = ?',
			[req.params.post_id], function(err, result) {checkResult(err, result, connection, res);}
		);
	});
});

// Help methods:

/**
* Make the neccesary setup for a put request.
*/
function putRequestSetup(iD, data, connection, tableName, tableIDPrefix) {
	if (!tableIDPrefix) {tableIDPrefix = tableName;}
	if(!iD) {
		connection.release();
		res.status(400).json({'Error' : (tableIDPrefix + '_id not specified: ') } + err);
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
	request += ' WHERE ' + tableIDPrefix + '_id = ' + iD;
	return [request, parameters];
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
	if (err)
		return res.status(500).send();
	if (result)
		res.status(200).json(result);
}