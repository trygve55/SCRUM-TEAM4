var router = require('express').Router(),
    auth = require('../auth'),
    router = require('express').Router(),
    formidable = require('formidable'),
    Jimp = require("jimp");

module.exports = router;

router.get('/all', function(req, res){
    pool.getConnection(function(err, connection){
        if(err)
            return res.status(500).send("Error");
        connection.query("SELECT person_id, forename, middlename, lastname, username FROM person", function(err, result){
            if(err)
                res.status(500).send(err.code);
            else
                res.json(result);
        });
    });
});

//register user
router.post('/register', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }
        console.log('Connected to database');
        var user = req.body;

        if(!checkValidUsername(user.username) && !checkValidEmail(user.email)){
            connection.release();
            res.status(400).send("Bad request");
        }

        connection.query('SELECT COUNT(username) AS counted FROM person WHERE username = ?', [user.username], function (err, result) {
            if(err) {
                console.log(err);
            }

            if (result[0].counted === 1) {
                connection.release();
                return res.status(400).send("Bad request");
            }

            connection.query('SELECT COUNT(email) AS counted FROM person WHERE email = ?', [user.email], function (err, result) {
                if(err) {
                    console.log(err);
                }

                if (result[0].counted === 1) {
                    connection.release();
                    return res.status(400).send("Bad request");
                }

                user.shopping_list_id = 0;
                auth.hashPassword(user, function (user) {

                    var values = [
                        user.email,
                        user.username,
                        user.password_hash,
                        user.forename,
                        user.middlename,
                        user.lastname,
                        user.phone,
                        new Date(user.birth_day).toISOString().slice(0, 10),
                        user.gender,
                        user.profile_pic,
                        user.shopping_list_id
                    ];

                    if(user.phone){
                        if(!checkValidPhone(user.phone)){
                            connection.release();
                            return res.status(400).send("Check phone number");
                        }
                    }

                    if(!checkValidName(user.name) && !checkValidName(user.middlename) && !checkValidName(user.lastname)){
                        connection.release();
                        return rest.status(400).send("Forename, middlename or lastname wrong");
                    }


                    connection.query('INSERT INTO person ' +
                        '(email, username, password_hash, forename, middlename,' +
                        'lastname, phone, birth_date,' +
                        'gender, profile_pic, shopping_list_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)', values, function(err, result) {
                        if (err) console.log(err);
                        connection.release();
                        res.json({message: "true"});
                    });
                });
            });
        });
    });
});

//call for checking if username is valid
router.get('/user', function (req, res) {
    pool.getConnection(function (err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        var username = req.query.username;

        if(!checkValidUsername(username)){
            connection.release();
            return res.status(400).send("Bad Request");
        }

        connection.query('SELECT COUNT(username) AS counted FROM person WHERE username = ?', [username], function (err, result){
            if(result[0].counted === 1) {
                connection.release();
                return res.status(400).send("Bad Request");
            }
            connection.release();
            res.status(200).send("OK");
        });
    });
});

//call for checking if email is valid
router.get('/mail', function (req, res) {
    pool.getConnection(function (err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        var email = req.query.email;

        if(!checkValidEmail(email)){
            connection.release();
            return res.status(400).send("Bad Request");
        }

        connection.query('SELECT COUNT(email) AS counted FROM person WHERE email = ?', [email], function (err, result){
            if(result[0].counted === 1) {
                connection.release();
                return res.status(400).send("Bad Request");
            }
            connection.release();
            res.status(200).send("OK");
        });
    });
});

function checkValidPhone(phonenumber){
    var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im; //TODO: find better solution for regex
    return regex.test(phonenumber);
}

function checkValidName(nameString) {
    //best regex
    var regex = /[a-zA-ZÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
    return regex.test(nameString);
}

function checkValidUsername(username) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username.toLowerCase());
}

function checkValidEmail(email) {
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email.toLowerCase());
}

//search for user
router.post('/search', function(req, res){
	var search = req.body.searchString;
	console.log('Searching for ' + search);
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({'Error' : 'connecting to database: ' } + err);
			connection.release();
			return;
		}
		console.log('Connected to database');
		connection.query(
			"SELECT DISTINCT person_id FROM person WHERE CONCAT(email, username, forename, lastname) LIKE CONCAT('%', ?,'%')",
			[search],
			function (err, result) {
				if (err) {throw err;}
				if (result) {
				    connection.release();
				    console.log(result); //TODO: get method to return results from sql-search
                }
		});
	});
});

router.get('/:person_id/picture', function(req, res){
    console.log('GET-request established');

    pool.getConnection(function (err, connection) {
        connection.query("SELECT profile_pic FROM person WHERE person_id = ?;", [req.params.person_id], function (error, results, fields) {
            connection.release();
            if(err) {
                res.status(500).json({'Error' : 'connecting to database: ' } + err);
                return;
            }

            if(results.length == 0) {
                res.status(404).json({error: 'no profile picture.'});
                return;
            }

            if(results) res.contentType('jpeg').status(200).end(results[0].profile_pic, 'binary');
        });
    });
});

router.get('/:person_id/picture_tiny', function(req, res){
    console.log('GET-request established');

    pool.getConnection(function (err, connection) {
        connection.query("SELECT profile_pic_tiny FROM person WHERE person_id = ?;", [req.params.person_id], function (error, results, fields) {
            connection.release();
            if(err) {
                res.status(500).json({'Error' : 'connecting to database: ' } + err);
                return;
            }

            if(results.length == 0) {
                res.status(404).json({error: 'no profile picture.'});
                return;
            }

            if(results) res.contentType('jpeg').status(200).end(results[0].profile_pic, 'binary');
        });
    });
});

/*
router.all('/profile/1/picture', function(req, res, next) {
    console.log("session test");
    console.log(req.session);
    next();
});

*/

//update profile
router.put('/:person_id', function(req, res){
    console.log("put-request");
    pool.getConnection(function (err, connection) {
        if(err) {
            return res.status(500).send({"Error" : "Connecting to database"} + err);
        }

        var parameter = req.params;

        var query = putRequestSetup(parameter.person_id, req.body, connection, "person");
        connection.query(query[0], query[1], function (err, result) {
            connection.release();
            if (err) console.log("" + err);
            if (result) console.log(result);
            return res.status(200).json({"success" : query[1] + " updated"});
        });
    });
});

function putRequestSetup(iD, data, connection, tableName) {
    if(!iD) {
        connection.release();
        res.status(400);
        res.json({'Error' : (tableName + '_id not specified: ') } + err);
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

router.post('/:person_id/picture', function(req, res){
    console.log('POST-request established');

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

        var path = files.file.path,
            file_size = files.file.size;

        if (file_size > 4000000) {
            res.status(400).json({'error': 'image file over 4MB'});
            return;
        }

        console.log("Loading image");
        Jimp.read(path, function (err, img) {
            if (err) {
                res.status(500).json({'Error': err});
                return;
            }

            var img_tiny = img.clone();
            console.log("Processing image");

            img.background(0xFFFFFFFF)
                .contain(500, 500)
                .quality(70)
                .getBuffer(Jimp.MIME_JPEG, function (err, data) {
                    if (err) {
                        res.status(500).json({'Error': err});
                        return;
                    }
                    img_tiny.cover(128, 128)
                        .quality(60)
                        .getBuffer(Jimp.MIME_JPEG, function (err, data_tiny) {
                            if (err) { res.status(500).json({'Error': err});
                                return;
                            }
                            pool.getConnection(function (err, connection) {
                                if (err) {
                                    res.status(500).json({'Error': err});
                                    return;
                                }

                                console.log("Uploading image");

                                connection.query("UPDATE person SET profile_pic = ?, profile_pic_tiny = ? WHERE person_id = ?;", [data, data_tiny, req.params.person_id], function (err, results, fields) {
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
