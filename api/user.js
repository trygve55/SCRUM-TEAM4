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
            connection.release();
            if(err)
                res.status(500).send(err.code);
            else {
                if(!req.query.slim)
                    res.json(result);
                else {
                    var r = [];
                    for(var i = 0; i < result.length; i++){
                        r.push(result[i].forename + " " + (result[i].middlename ? result[i].middlename + " " : "") + result[i].lastname)
                    }
                    res.json(r);
                }
            }
        });
    });
});

//register user
router.post('/register', function(req, res) {
    console.log('POST-request established');
    pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            res.status(500).json({'Error': 'connecting to database: '} + err);
            return;
        }

        console.log('Connected to database');
        var user = req.body;

        if (!checkValidUsername(user.username) && !checkValidEmail(user.email)) {
            connection.release();
            res.status(400).json({message:"Syntax-error"})
        }

        connection.query('SELECT COUNT(username) AS counted FROM person WHERE username = ?', [user.username], function (err, result) {
            if (err) {
                connection.release();
                res.status(500).json({error: err});
            }

            if (result[0].counted === 1) {
                connection.release();
                return res.status(200).json({message:"Username already in use"});
            }

            connection.query('SELECT COUNT(email) AS counted FROM person WHERE email = ?', [user.email], function (err, result) {
                if (err) {
                    connection.release();
                    res.status(500).json({error: err});
                }

                if (result[0].counted === 1) {
                    connection.release();
                    return res.status(200).json({message: "E-mail in use"});
                }


                connection.beginTransaction(function (err) {
                    if (err) {
                        connection.release();
                        console.log(err);
                        res.status(500).json({message: "database connection failed"});
                    } else connection.query('INSERT INTO shopping_list (currency_id) VALUES(?)', [100], function (err, result) {
                        if (err) {
                                connection.rollback(function () {
                                connection.release();
                                console.log(err);
                                res.status(500).json({error: err});
                            });
                        } else {

                            user.shopping_list_id = result.insertId;
                            auth.hashPassword(user, function (user) {

                                var values = [
                                    user.email,
                                    user.username,
                                    user.password_hash,
                                    user.forename,
                                    user.middlename,
                                    user.lastname,
                                    user.phone,
                                    user.birth_day ? new Date(user.birth_day).toISOString().slice(0, 10) : null,
                                    user.gender,
                                    user.profile_pic,
                                    user.shopping_list_id
                                ];

                                if (user.phone) {
                                    if (!checkValidPhone(user.phone)) {
                                        connection.release();
                                        return res.status(400).send("Phone number is not valid");
                                    }
                                }

                                if (user.middlename) {
                                    if (!checkValidName(user.middlename)) {
                                        connection.release();
                                        return res.status(400).send("Middlename is not valid");
                                    }
                                }

                                if (!checkValidForename(user.forename)) {
                                        connection.release();
                                        return res.status(400).json({message:"Invalid forename"});
                                }

                                if (!checkValidName(user.lastname)){
                                    connection.release();
                                    return res.status(400).json({message:"Invalid lastname"});
                                };


                                connection.query('INSERT INTO person ' +
                                    '(email, username, password_hash, forename, middlename,' +
                                    'lastname, phone, birth_date,' +
                                    'gender, profile_pic, shopping_list_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)', values, function (err, result) {
                                    if (err) {
                                            connection.rollback(function () {
                                            connection.release();
                                            console.log(err);
                                            res.status(500).json({error: err});
                                        });
                                    } else {
                                        connection.commit(function (err) {
                                            if (err) {
                                                connection.rollback(function () {
                                                    connection.release();
                                                    console.log(err);
                                                    res.status(500).json({error: err});
                                                });
                                            } else {
                                                connection.release();
                                                //req.session.person_id = result.insertId;
                                                //req.session.save();
                                                res.status(200).json({message: "Transaction successful"});
                                            }
                                        });
                                    }
                                });
                            });
                        }
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
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        var username = req.query.username;

        if(!checkValidUsername(username)){
            connection.release();
            return res.status(400).json({message:"Syntax-error"});
        }

        connection.query('SELECT COUNT(username) AS counted FROM person WHERE username = ?', [username], function (err, result){
            if(result[0].counted === 1) {
                connection.release();
                return res.status(200).json({message:"Username already exists"});
            }
            connection.release();
            res.status(200).send("Username valid");
        });
    });
});

//call for checking if email is valid
router.get('/mail', function (req, res) {
    pool.getConnection(function (err, connection) {
        if(err) {
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        var email = req.query.email;

        if(!checkValidEmail(email)){
            connection.release();
            return res.status(400).json({message:'Syntax-error'});
        }

        connection.query('SELECT COUNT(email) AS counted FROM person WHERE email = ?', [email], function (err, result){
            if(result[0].counted === 1) {
                connection.release();
                return res.status(200).json({message:'E-mail already exists'});
            }
            connection.release();
            res.status(200).json({message:'E-mail valid'});
        });
    });
});

function checkValidPhone(phonenumber){
    var phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im; //TODO: find better solution for regex
    return phoneRegex.test(phonenumber);
}

//returns true if valid
function checkValidName(nameString) {
    //best regex
    var nameRegex = /[a-zA-ZÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
    if (nameString) return nameRegex.test(nameString);
}

//spaces not allowed
function checkValidForename(nameString) {
    //best regex
    var nameRegex = /^\S[a-zA-ZÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
    if (nameString) return nameRegex.test(nameString);
}

//spaces allowed
function checkValidUsername(username) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    if(username) return usernameRegex.test(username.toLowerCase());
}

function checkValidEmail(email) {
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email) return emailRegex.test(email.toLowerCase());
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

//which one?
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


/*
Returns the requested information about the requested user(s). The request can contain two variables: variables (required) and
users, both arrays. The first one is a list of the variables you would like to retrieve, while the second is a list of
user IDs for which you would like to retrieve those variables' data. To request data for the currently logged in session,
you only send the variables you'd like.
Sensitive data variables are only available to the current session's user.

Variables available to all logged in users:
username, forename, middlename, lastname, gender, profile_pic, profile_pic_tiny and last_active
Variables only available to users about themselves:
email, phone, birth_date, is_verified, shopping_list_id, user_language, user_deactivated, facebook_api_id

Example 1: the client needs to know the first and last names, gender, and profile_pic_tiny (all public) of some person_ids
Request URL : /api/user/getUser?variables=forename&variables=lastname&variables=gender&variables=profile_pic_tiny&users=309&users=49
{
    variables: ['forename', 'lastname', 'gender', 'profile_pic_tiny'],
    users: [309, 49]
}

Example 2: the client needs to know the email, phone, and user_language (all private) of the currently logged in user
Request URL : /api/user/getUser?variables=email&variables=phone&variables=user_language
{
    variables: ['email', 'phone', 'user_language'],
}
 */

var publicVars = ['username', 'forename', 'middlename', 'lastname', 'gender', 'profile_pic',
    'profile_pic_tiny', 'last_active'];
var privateVars = ['email', 'phone', 'birth_date', 'is_verified', 'shopping_list_id', 'user_language',
    'user_deactivated', 'facebook_api_id'];

function reqForPrivateVars(reqVars) {
    var result = false;
    reqVars.forEach(function(element) {
        if(privateVars.indexOf(element) > -1) {
            result = true;
            return;
        }
    });
    return result;
}

router.get('/getUser', function(req, res) {
    console.log(req.query);
    if(!req.query.hasOwnProperty('users')) {
        req.query.users = [req.session.person_id];
    } else if(reqForPrivateVars(req.query.variables) && (req.query.users.length > 1 || req.session.person_id != req.query.users[0])) {
        return res.status(403).send("Forbidden request (private data are only available to the owner)");
    }
    if(!req.session.person_id) {
        return res.status(403).send("Forbidden request (session not found)");
    }
    if(checkRequestArray(req.query.variables, req.query.users) > 0) {
        return res.status(400).send("Bad request (bad variable names");
    }
    var users = req.query.users,
        variables = req.query.variables;
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500).send("Internal database error");
        }
        //result = getVariables(req.query.variables, req.query.users, connection);
        var sqlQuery = "SELECT";
        variables.forEach(function(element) {
            sqlQuery += ' ' + element + ',';
        });
        sqlQuery = sqlQuery.slice(0,-1);
        sqlQuery += ' FROM person WHERE';
        users.forEach(function(element) {
            sqlQuery += ' person_id = ' + element + ' OR'
        });
        sqlQuery = sqlQuery.slice(0,-3);
        connection.query(sqlQuery, function(err, result) {
            if(err) {
                res.status(500).send("Error in SQL query");
                connection.release();
                return;
            }
            connection.release();
            res.status(200).send(result);
        });
    });
});

function checkRequestArray(variables, users) {
    var validInput = ['person_id', 'email', 'username',
        'forename', 'middlename',
        'lastname', 'phone', 'birth_date', 'is_verified',
        'gender', 'profile_pic', 'profile_pic_tiny',
        'last_active', 'shopping_list_id',
        'user_language', 'user_deactivated', 'facebook_api_id'];
    var errors = 0;
    variables.forEach(function(element) {
        if(validInput.indexOf(element) < 0) errors++;
    });
    users.forEach(function(element) {
        if(isNaN(element)) errors++;
    });
    return errors;
}


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




