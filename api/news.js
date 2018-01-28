var router = require('express').Router(),
    formidable = require('formidable'),
    Jimp = require("jimp");

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

	console.error("POST");
    var form = new formidable.IncomingForm();
    return form.parse(req, function(err, fields, files) {
    	if (err)
            return res.status(400).send(err);

        var data = fields;

        data.post_text = req.sanitize(data.post_text);

        var path = files.File.path,
            file_size = files.File.size;

        // Check if this request is ok.
        if(!data.group_id || (!data.post_text && !files.File))
            return res.status(400).send();

        if (!data.post_text) data.post_text = "";

        if(!files.File) {
            data.attachment_type = 0;
            return savePostToDatabase(req, res, data);
        }

        if (file_size > 4000000)
            return res.status(400).json({'error': 'image file over 4MB'});

        Jimp.read(path, function (err, img) {
            if (err)
                return res.status(500).json({'Error': err});

            if (img.bitmap.height > 750 || img.bitmap.width > 750)
            	img.background(0x00000000)
					.scaleToFit(750, 750);

        	img.quality(70).getBuffer(Jimp.MIME_JPEG, function (err, imgdata) {
                savePostToDatabase(req, res, data, imgdata);
            });
    	});
    });
});

function savePostToDatabase(req, res, data, imgdata) {
	console.log(data.post_text);
    pool.query(
        'INSERT INTO newsfeed_post (' +
        'group_id, posted_by_id, post_text, attachment_type, attachment_data' +
        ') VALUES (?,?,?,?,?);',
        [data.group_id, req.session.person_id, data.post_text, data.attachment_type, imgdata],	// data.posted_by_id to test this.
        function (err, result) {
            if (err)
                return res.status(500).send(err);
            pool.query('SELECT ' +
                'post_id, post_text, attachment_type, posted_datetime, person.forename, person.middlename, person.lastname, home_group.group_id, home_group.group_name, person.person_id ' +
                'FROM newsfeed_post LEFT JOIN person ON (person.person_id = newsfeed_post.posted_by_id) LEFT JOIN home_group USING (group_id) WHERE post_id = ?;',
                [result.insertId], function (err, result) {
                    checkResult(err, {}, res);
                    socket.group_data('group post', data.group_id, result);
                });
        }
    );
}

router.get('/data/:post_id', function(req, res){
    pool.query("SELECT attachment_data FROM newsfeed_post WHERE post_id = ?;", [req.params.post_id], function (err, results, fields) {
        if(err)
            return res.status(500).json({'Error' :err });

        if(!results[0].attachment_data)
            return res.status(404).json({error: 'no group picture.'});

        res.contentType('jpeg').status(200).end(results[0].attachment_data, 'binary');
    });
});

/**
 * Get the posts for a group.
 *
 * URL: /api/news/{group_id}
 * method: GET
*/
router.get('/:group_id', function(req, res) {
    pool.query('SELECT ' +
		'post_id, posted_by_id, post_text, attachment_type, posted_datetime, ' +
		'forename, middlename, lastname FROM newsfeed_post ' +
		'LEFT JOIN person ON person.person_id = newsfeed_post.posted_by_id ' +
		'WHERE group_id = ? ORDER BY posted_datetime DESC',
		[req.params.group_id], function(err, result) {
			if (err)
				return res.status(500).json({error: err});
			var posts = [];
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
    });
});

/**
 * Get the posts for a user.
 *
 * URL: /api/news/
 * method: GET
*/
router.get('/', function(req, res) {
	pool.query('SELECT post_id, post_text, attachment_type, posted_datetime, person.forename, person.middlename, person.lastname, home_group.group_name, person.person_id FROM newsfeed_post LEFT JOIN person ON (person.person_id = newsfeed_post.posted_by_id) LEFT JOIN home_group USING (group_id) WHERE group_id IN (SELECT group_id FROM group_person WHERE person_id = ?) ORDER BY posted_datetime DESC;',
		[req.session.person_id, req.session.person_id], function(err, result) {
			return (err) ? (res.status(500).send()) : (res.status(200).json(result));
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
	if (err)
		return res.status(500).send();
	if (result)
		res.status(200).json(result);
}