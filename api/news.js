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
    pool.query(
        'INSERT INTO newsfeed_post (' +
        'group_id, posted_by_id, post_text, attachment_type, attachment_data' +
        ') VALUES (?,?,?,?,?);',
        [data.group_id, data.req.session.person_id, data.post_text, data.attachment_type, extraData],	// data.posted_by_id to test this.
        function(err, result) {checkResult(err, result, res);}
    );
});

/**
 * Get the posts for a group.
 *
 * URL: /api/news/{group_id}
 * method: GET
*/
router.get('/:group_id', function(req, res) {
    pool.query('SELECT * FROM newsfeed_post WHERE group_id = ?',
        [req.params.group_id], function(err, result) {
            if (err) {return res.status(500).send();}
            res.status(200).json(result);
        }
    );
});

/**
 * Get the posts for a user.
 *
 * URL: /api/news/
 * method: GET
*/
router.get('/', function(req, res) {
    poolquery('SELECT * FROM newsfeed_post WHERE group_id IN (SELECT group_id FROM group_person WHERE person_id = ?);',
        [req.session.person_id], function(err, result) {	//req.params.person_id
            if (err) {return res.status(500).send();}
            res.status(200).json(result);
        }
    );
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
    var query = putRequestSetup(req.params.post_id, req.body, "newsfeed_post", "post");
    pool.query(
        query[0], query[1],
        function(err, result) {checkResult(err, result, res);}
    );
});

/**
 * Delete this post.
 *
 * URL: /api/news/{post_id}
 * method: DELETE
*/
router.delete('/:post_id', function(req, res) {
    pool.query('DELETE FROM newsfeed_post WHERE post_id = ?',
        [req.params.post_id], function(err, result) {checkResult(err, result, res);}
    );
});

// Help methods:

/**
* Make the neccesary setup for a put request.
*/
function putRequestSetup(iD, data, tableName, tableIDPrefix) {
	if (!tableIDPrefix) {tableIDPrefix = tableName;}
	if(!iD) {
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
* Check the result, release connection and return.
*/
function checkResult(err, result, res) {
	if (err) {
		res.status(500).send();
		console.log(err);
	}
	if (result) {res.status(200).send();}
}