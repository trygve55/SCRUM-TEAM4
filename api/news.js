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
	var extraData = null;
	if (data.attachment_data) {extraData = data.attachment_data;}
	pool.getConnection(function(err, connection) {
		if (!checkConnectionError(err, connection, res)) {return;}
		connection.query(
			'INSERT INTO newsfeed_post (' +
			'group_id, posted_by_id, post_text, attachment_type, attachment_data' +
			') VALUES (?,?,?,?,?);',
			[data.group_id, data.req.session.person_id, data.post_text, data.attachment_type, extraData],	// data.posted_by_id to test this.
			function(err, result) {checkResult(err, result, connection, res);}
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

		connection.query('SELECT * FROM newsfeed_post WHERE group_id = ?',
			[req.params.group_id], function(err, result) {
				connection.release();
				if (err) {return res.status(500).send();}
				res.status(200).json(result);
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

		connection.query('SELECT * FROM newsfeed_post WHERE group_id IN (SELECT group_id FROM group_person WHERE person_id = ?);',
			[req.session.person_id], function(err, result) {	//req.params.person_id
				connection.release();
				if (err) {return res.status(500).send();}
				res.status(200).json(result);
			}
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
	if (err) {
		res.status(500).send();
		throw err;
	}
	if (result) {res.status(200).send();}
}