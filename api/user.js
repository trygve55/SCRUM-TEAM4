var router = require('express').Router(),
    auth = require('../auth'),
    router = require('express').Router(),
    formidable = require('formidable'),
    Jimp = require("jimp"),
    fs = require('fs'),
    path = require('path'),
    nodemailer = require('nodemailer'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt');

module.exports = router;

/**
 * Get person-info
 *
 * URL: /api/user/all
 * method: GET
 *
 */
router.get('/all', function(req, res){
   if(!req.session.person_id)
        return res.status(403).send();
    pool.getConnection(function(err, connection){
        if(err) {
            connection.release();
            return res.status(500).send("Error");
        }
        connection.query("SELECT person_id, email, forename, middlename, lastname, username FROM person;", function(err, result){
            connection.release();
            if(err)
                res.status(500).send(err.code);
            else {
                if(!req.query.slim)
                    res.status(200).json(result);
                else {
                    var r = [];
                    for(var i = 0; i < result.length; i++){
                        if(result[i].person_id == req.session.person_id)
                            continue;
                        r.push({
                            name: result[i].forename + " " + (result[i].middlename ? result[i].middlename + " " : "") + result[i].lastname,
                            email: result[i].email,
                            id: result[i].person_id
                        });
                    }
                    res.status(200).json(r);
                }
            }
        });
    });
});

router.get('/checkFacebook', function(req, res){
    if(!req.session.person_id)
        return res.status(403).send();
    pool.query('SELECT facebook_api_id FROM person WHERE person_id = ?', [req.session.person_id], function (err, result) {
        if(err) {
            return res.status(500).json({error: err});
        } else {
            if (result[0].facebook_api_id == null)
                return res.status(400).json({facebook: false});
            else
                return res.status(200).json({facebook: true});
        }
    });
});

/**
 * Check password
 *
 * URL: /api/user/checkPassword
 * method: POST
 * data: {
 *      password
 * }
 */


router.post('/checkPassword', function (req, res) {
   if (req.session.person_id == null) {
       return res.status(403).send("Invalid request, you must log in");
   }

   var user = req.body;

   if (!user.password) {
       return res.status(400).send("No data");
   }

   pool.query('SELECT facebook_api_id FROM person WHERE person_id = ?', [req.session.person_id], function (err, result) {
        if(err) {
            return res.status(500).send("DB_ERROR");
        } else {
            if (result[0].facebook_api_id != null)
                return res.status(400).send("ERROR");
            else {
                pool.query(
                    'SELECT password_hash FROM person WHERE person_id = ?;',
                    [req.session.person_id],
                    function (err, result) {
                        if (err)
                            return res.status(500).send("ERROR: executing query");
                        else bcrypt.compare(user.password, result[0].password_hash, function(err, hash_res){
                            if(hash_res)
                                return res.status(200).json({password: true, message: "password do match"});
                            else
                                return res.status(400).json({password: false, message: "password does not match"});
                    });
                });
            }
        }
   });
});

/**
 * Change password for the currently logged in user
 *
 * URL: /api/user/password
 * method: PUT
 * data: {
 *      password
 * }
 */


router.put('/password', function (req, res) {
    if(req.session.person_id == null) {
        return res.status(403).send("Invalid request, you must log in");
    }

    var user = req.body;

    if(!user.password)
        return res.status(400).send("empty password body");

    if(!checkValidPassword(user.password))
        return res.status(400).json({"error":"Minimum eight characters, at least one letter and one number:"});

    pool.query('SELECT facebook_api_id FROM person WHERE person_id = ?', [req.session.person_id], function (err, result) {
        if(err) {
            return res.status(500).send("DB_ERROR");
        } else {
            if (result[0].facebook_api_id != null)
                return res.status(400).send("ERROR: login without facebook to change password");
            else {
                auth.hashPassword(user, function(user) {
                    pool.query(
                        'UPDATE person SET password_hash = ? WHERE person_id = ?;',
                        [user.password_hash, req.session.person_id],
                        function (err) {
                            if (err)
                                return res.status(500).send("ERROR: executing query");
                            else
                                return res.status(200).send("SUCCESS: password changed");
                    });
                });
            }
        }
    });
});

/**
 * Register a new user
 *
 * URL: /api/user/register
 * method: POST
 * data: {
 *      forename,
 *      lastname,
 *      username,
 *      email,
 *      password,
 *      [phone],
 *      [lang]
 * }
 */

router.post('/register', function(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            connection.release();
            res.status(500).json({'Error': 'connecting to database: '} + err);
            return;
        }

        var user = req.body;

        console.log(user.email);

        if (!checkValidUsername(user.username) && !checkValidEmail(user.email)) {
            connection.release();
            res.status(400).json({message:"Syntax-error"})
        }

        connection.query('SELECT COUNT(username) AS counted FROM person WHERE username = ?;', [user.username], function (err, result) {
            if (err) {
                connection.release();
                res.status(500).json({error: err});
            }

            if (result[0].counted === 1) {
                connection.release();
                return res.status(400).json({message:"Username already in use"});
            }

            connection.query('SELECT COUNT(email) AS counted FROM person WHERE email = ?;', [user.email], function (err, result) {
                if (err) {
                    connection.release();
                    res.status(500).json({error: err});
                }

                if (result[0].counted === 1) {
                    connection.release();
                    return res.status(400).json({message: "E-mail in use"});
                }

                connection.beginTransaction(function (err) {
                    if (err) {
                        connection.release();
                        res.status(500).json({message: "database connection failed"});
                    } else connection.query('INSERT INTO shopping_list (currency_id) VALUES(?);', [100], function (err, result) {
                        if (err) {
                                connection.rollback(function () {
                                connection.release();
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
                                }

                                connection.query('INSERT INTO person ' +
                                    '(email, username, password_hash, forename, middlename,' +
                                    'lastname, phone, birth_date,' +
                                    'gender, profile_pic, shopping_list_id) VALUES (?,?,?,?,?,?,?,?,?,?,?);', values, function (err, response) {
                                    if (err) {
                                            connection.rollback(function () {
                                            connection.release();
                                            res.status(500).json({error: err});
                                        });
                                    } else {
                                        var token = jwt.sign({
                                            iss: issuer,
                                            id: response.insertId
                                        }, secret);
                                        connection.query('UPDATE person SET verify_token = ? WHERE person_id = ?', [token, response.insertId], function(err) {
                                            if (err) {
                                                connection.rollback(function () {
                                                    connection.release();
                                                    return res.status(500).send("Internal database error (1)");
                                                });
                                            } else {
                                                connection.commit(function (err) {
                                                    if (err) {
                                                        connection.rollback(function () {
                                                            connection.release();
                                                            res.status(500).json({error: err});
                                                        });
                                                    } else {
                                                        connection.release();
                                                        if (req.body.lang == null || !verifyAccountEmails.hasOwnProperty(req.body.lang)) {
                                                            var mail = verifyAccountEmails.en_US;
                                                        } else {
                                                            var mail = verifyAccountEmails[req.body.lang];
                                                        }
                                                        var url = urlVerify + token;
                                                        mailOptions.to = user.email;
                                                        mailOptions.subject = mail.subject;
                                                        mailOptions.text = mail.text.replace("#name", user.forename).replace("#url", url);
                                                        transporter.sendMail(mailOptions, function (error, info) {
                                                            if (error) {
                                                                return res.status(500).send("Internal server error in email (1), person entry created");
                                                            } else {
                                                                res.status(200).send("Transaction successful, email sent");
                                                            }
                                                        });
                                                    }
                                                });
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

/**
 * Check username syntax/availability
 *
 * URL: /api/user/user
 * method: GET
 *
 */

router.get('/user', function (req, res) {
    pool.getConnection(function (err, connection) {
        if(err) {
            connection.release();
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        var username = req.query.username;

        if(!checkValidUsername(username)){
            connection.release();
            return res.status(400).json({message:"Syntax-error"});
        }

        connection.query('SELECT COUNT(username) AS counted FROM person WHERE username = ?;', [username], function (err, result){
            connection.release();
            if(result[0].counted === 1) {
                return res.status(200).json({message:"Username already exists"});
            }
            res.status(200).json({message:"Username valid"});
        });
    });
});

/**
 * Check email syntax/availability
 *
 * URL: /api/user/email
 * method: GET
 *
 */

router.get('/mail', function (req, res) {


    pool.getConnection(function (err, connection) {
        if(err) {
            connection.release();
            res.status(500).json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        var email = req.query.email;

        if(!checkValidEmail(email)){
            connection.release();
            return res.status(400).json({message:'Syntax-error'});
        }

        connection.query('SELECT COUNT(email) AS counted FROM person WHERE email = ?;', [email], function (err, result){
            connection.release();
            if(result[0].counted === 1) {
                return res.status(200).json({message:'E-mail already exists'});
            }
            res.status(200).json({message:'E-mail valid'});
        });
    });
});

/**
 *
 *
 *
 */

function checkValidPhone(phonenumber){
    return true;
    var phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im; //TODO: find better solution for regex
    return phoneRegex.test(phonenumber);
}

/**
 * Excludes numbers and special characters
 */

function checkValidName(nameString) {
    var nameRegex = /[a-zA-ZÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
    if (nameString) return nameRegex.test(nameString);
}

/**
 * Excludes numbers, spaces and special characters
 */

function checkValidForename(nameString) {
    var nameRegex = /^\S[a-zA-ZÆÐƎƏƐƔĲŊŒẞÞǷȜæðǝəɛɣĳŋœĸſßþƿȝĄƁÇĐƊĘĦĮƘŁØƠŞȘŢȚŦŲƯY̨Ƴąɓçđɗęħįƙłøơşșţțŧųưy̨ƴÁÀÂÄǍĂĀÃÅǺĄÆǼǢƁĆĊĈČÇĎḌĐƊÐÉÈĖÊËĚĔĒĘẸƎƏƐĠĜǦĞĢƔáàâäǎăāãåǻąæǽǣɓćċĉčçďḍđɗðéèėêëěĕēęẹǝəɛġĝǧğģɣĤḤĦIÍÌİÎÏǏĬĪĨĮỊĲĴĶƘĹĻŁĽĿʼNŃN̈ŇÑŅŊÓÒÔÖǑŎŌÕŐỌØǾƠŒĥḥħıíìiîïǐĭīĩįịĳĵķƙĸĺļłľŀŉńn̈ňñņŋóòôöǒŏōõőọøǿơœŔŘŖŚŜŠŞȘṢẞŤŢṬŦÞÚÙÛÜǓŬŪŨŰŮŲỤƯẂẀŴẄǷÝỲŶŸȲỸƳŹŻŽẒŕřŗſśŝšşșṣßťţṭŧþúùûüǔŭūũűůųụưẃẁŵẅƿýỳŷÿȳỹƴźżžẓ]+$/;
    if (nameString) return nameRegex.test(nameString);
}

/**
 * Excludes all special characters and spaces
 */

function checkValidUsername(username) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    if(username) return usernameRegex.test(username.toLowerCase());
}

/**
 * Minimum 8 characters, one upper case letter and one number
 */

function checkValidPassword(password) {
    var usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return usernameRegex.test(password);
}

/**
 * Only valid email will return true
 * [username]@[domain]
 */

function checkValidEmail(email) {
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email) return emailRegex.test(email.toLowerCase());
}


/**
 *
 *
 *
 */

router.get('/:person_id/picture', function(req, res){
    pool.query("SELECT profile_pic, has_profile_pic FROM person WHERE person_id = ?;", [req.params.person_id], function (err, results, fields) {
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);
            if(!results[0] || !results[0].has_profile_pic){
                var p = path.join(__dirname, '../public/img/profilPicture.png');
                var stat = fs.statSync(p);

                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': stat.size
                });

                return fs.createReadStream(p).pipe(res);
            }

            res.contentType('jpeg').status(200).end(results[0].profile_pic, 'binary');
    });
});

router.get('/:person_id/picture_tiny', function(req, res){
    pool.query("SELECT profile_pic_tiny, has_profile_pic  FROM person WHERE person_id = ?;", [req.params.person_id], function (err, results, fields) {
        if (err)
            return res.status(500).json({'Error': 'connecting to database: '} + err);
        if (!results[0].has_profile_pic){
            var p = path.join(__dirname, '../public/img/profilPicture.png');
            var stat = fs.statSync(p);

            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': stat.size
            });
            return fs.createReadStream(p).pipe(res);
        }

        res.contentType('jpeg').status(200).end(results[0].profile_pic_tiny, 'binary');
    });
});



/**
 * Update profile
 *
 * URL: /api/user/
 * method: PUT
 * data (body) {
 *      [username], [forename], [middlename],
 *      [lastname], [phone], [gender], [birth_date],
 *      [profile_pic], [profile_pic_tiny], [last_active],
 *      [user_language]
 * }
 */


router.put('/', function(req, res) {
    if(req.session.person_id == null) {
        return res.status(403).send("Invalid request, you must log in");
    }
    var changeableVars = ["username", "forename", "middlename", "lastname", "phone", "gender", "birth_date",
        "profile_pic", "profile_pic_tiny", "last_active", "user_language"];
    for(var p in req.body) {
        if(changeableVars.indexOf(p) < 0) {
            return res.status(400).send("Bad variable: " + p);
        }
    }
    var sqlQuery = "UPDATE person SET ";
    for(var p in req.body) {
        sqlQuery += p + " = ?, "
    }
    sqlQuery = sqlQuery.slice(0,-2);
    sqlQuery += " WHERE person_id = ?";
    var values = [];
    for(var p in req.body) {
        values.push(req.body[p]);
    }
    values.push(req.session.person_id);


    pool.query(sqlQuery, values, function (err) {
            if (err) {
                return res.status(500).send("Internal database error(1)");
            }
            return res.status(200).send("Profile updated");
    });
});

router.post('/picture', function(req, res){
    if(req.session.person_id == null) {
        return res.status(403).send("Invalid request, you must log in");
    }

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
            if (err)
                return res.status(500).json({'Error': err});

            var img_tiny = img.clone();

            img.background(0xFFFFFFFF)
                .cover(500, 500)
                .quality(70)
                .getBuffer(Jimp.MIME_JPEG, function (err, data) {
                    if (err)
                        return res.status(500).json({'Error': err});
                    img_tiny.cover(128, 128)
                        .quality(60)
                        .getBuffer(Jimp.MIME_JPEG, function (err, data_tiny) {
                            if (err)
                                return res.status(500).json({'Error': err});

                            pool.query("UPDATE person SET profile_pic = ?, profile_pic_tiny = ?, has_profile_pic = 1 WHERE person_id = ?;", [data, data_tiny, req.session.person_id], function (err, results, fields) {
                                if (err)
                                    return res.status(500).json({'Error': err});
                                res.status(200).json(file_size);
                            });
                        });
                });
        });
    });
});

router.delete('/picture', function(req, res) {
    if(req.session.person_id == null) {
        return res.status(403).send("Invalid request, you must log in");
    }
    pool.query("UPDATE person SET profile_pic = NULL, profile_pic_tiny = NULL, has_profile_pic = 0 WHERE person_id = ?;", [data, data_tiny, req.session.person_id], function (err, results, fields) {
        if (err)
            return res.status(500).json({'Error': err});
        res.status(200).json(results);
    });
});

var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "hhmanager4@gmail.com",
            pass: "SCRuMteAm4"
        },
        tls: {
            rejectUnauthorized: false
        }
    }), mailOptions = {
        from: "hhmanager4@gmail.com",
        to: "",
        subject: "",
        text: ""
    },
    secret = "CONSTANT# VIGILANCE",
    issuer = "HHManager",
    urlReset = "http://localhost:8000/resetPassword.html?token=",
    urlVerify = "http://localhost:8000/verifyAccount.html?token=",
    resetPassEmails = {
        en_US: {text: "Hi #name,\n" +
                    "A request was made to reset the password associated with this email. Click the provided link to reset your password: \n\n" +
                    "#url\n\n"+
                    "The link expires in one hour.\n\n" +
                    "If you did not request this, please ignore this email, or respond to let us know. \n\n" +
                    "Thanks,\nHousehold Manager",
                subject: "Household Manager: forgotten password"},
        nb_NO: {text: "Hei #name,\n" +
                    "Vi mottok en forespørsel om å sette et nytt passord for kontoen koblet til denne emailen. Klikk på lenken for å sette et nytt passord:\n\n" +
                    "#url\n\n" +
                    "Lenken utløper om en time.\n\n" +
                    "Hvis du ikke ba om denne emailen vennligst ignorer den, eller svar på denne emailen for å la oss vite det.\n\n" +
                    "Hilsen,\nHousehold Manager"},
                subject: "Household Manager: glemt passord"},
    verifyAccountEmails = {
        en_US: {text: "Hi #name,\n" +
                    "Please verify your account by clicking on the link below to access Household Manager.\n\n" +
                    "#url\n\n" +
                    "If you did not create an account with us at this email please respond to let us know.\n\n" +
                    "Thanks,\nHousehold Manager",
                subject: "Household Manager: verify account"},
        nb_NO: {text: "Hei #name,\n" +
                    "Åpne lenken under for å verifisere kontoen din og få tilgang til Household Manager.\n\n" +
                    "#url\n\n" +
                    "Hvis du ikke lagde en konto hos oss med denne emailen kan du svare på denne emailen for å si fra.\n\n" +
                    "Hilsen,\nHousehold Manager",
                subject: "Household Manager: kontoverifikasjon"}};

/**
 * Verify account with token from email
 *
 * URL: /api/user/verifyAccount
 * method: POST
 * data: {
 *      token
 * }
 *
 */
router.post('/verifyAccount', function(req, res) {
    if(req.body.token == null) {
        return res.status(400).send("Bad request (no token variable)");
    }
    var token = req.body.token;
    jwt.verify(token, secret, {
        iss: issuer
    }, function(err, payload) {
        if(err) {
            console.log(token);
            console.log(err);
            return res.status(400).send("Bad token (1)");
        }
        pool.query('SELECT verify_token FROM person WHERE person_id = ?', [payload.id], function(err, result) {
            if(err) {
                return res.status(500).send("Internal database error (1)");
            }
            if(result.length < 1) {
                return res.status(400).send("Outdated / faulty token");
            }
            if(result[0].verify_token != token) {
                console.log(result[0].verify_token);
                console.log(token);
                return res.status(400).send("Bad token (2)");
            } else {
                pool.query("UPDATE person SET verify_token = NULL WHERE person_id = ?", [payload.id], function(err, result) {
                    if(err) {
                        return res.status(500).send("Internal database error(2)");
                    }
                    return res.status(200).send("Account verified");
                });
            }
        });
    });
});


/**
 * Send an email with a link to change a forgotten password. By default, the response is in English, but you can also
 * provide a lang attribute to specify the language of the email.
 *
 * URL: /api/user/forgottenPasswordEmail
 * method: POST
 * data: {
 *      email,
 *      [lang]
 * }
 */

router.post('/forgottenPasswordEmail', function(req,res) {
    if(!req.body.email) {
        return res.status(400).send("Bad request (no email variable)");
    }
    pool.query("SELECT COUNT(*), person_id, forename FROM person WHERE email = ?", [req.body.email], function(err, result) {
            if(err) {
                return res.status(500).send("Internal database error in query (1)");
            }
            if(result[0]["COUNT(*)"] == 0) {
                return res.status(404).send("Email not found");
            }
            var token = jwt.sign({
                id: result[0]["person_id"],
                iss: issuer,
                exp: Math.floor(Date.now() / 1000+ (60*60))
            }, secret);
            var url = urlReset + token;
            var name = result[0].forename;
            mailOptions.to = req.body.email;
            mailOptions.subject = "Household Manager: forgotten password";
            if(req.body.lang == null || !resetPassEmails.hasOwnProperty(req.body.lang)) {
                var text = resetPassEmails.en_US.text.replace("#name", name);
                mailOptions.subject = resetPassEmails.en_US.subject;
            } else {
                var text = resetPassEmails[req.body.lang].text.replace("#name", name);
                mailOptions.subject = resetPassEmails[req.body.lang].subject;
            }
            text = text.replace("#url", url);
            mailOptions.text = text;
            var sql = "UPDATE person SET reset_password_token = ? WHERE email = ?";
            pool.query(sql, [token, req.body.email], function(err) {
                if(err) {
                    return res.status(500).send("Internal database error in query (2)");
                }
                transporter.sendMail(mailOptions, function(error, info) {
                    if(error) {
                        return res.status(500).send("Internal server error in email (1)");
                    } else {
                        return res.status(200).send("Email sent: " + info.response);
                    }
            });
        });
    });
});

/**
 * Set new password with a JWT acquired from an email
 *
 * URL: /api/user/forgottenPasswordReset
 * method: POST
 * data: {
 *      new_password,
 *      token
 * }
 */

router.post('/forgottenPasswordReset', function(req, res) {
    if(!req.body.new_password || !req.body.token) {
        return res.status(400).send("Bad request (missing variable");
    }
    var token = req.body.token;
    jwt.verify(token, secret, {
        iss: issuer
    }, function(err, payload) {
        if(err) {
            return res.status(400).send("Bad token (1)");
        }
        pool.query("SELECT reset_password_token FROM person WHERE person_id = ?", [payload.id], function(err, result) {
                if(err) {
                    return res.status(500).send("Internal database error (2)");
                }
                if(result[0].reset_password_token == null) {
                    return res.status(500).send("Internal database/server error (possible bad token) (3)");
                }
                if(result[0].reset_password_token != token) {
                    return res.status(400).send("Bad token (2)");
                }
                var user = {password: req.body.new_password};
                auth.hashPassword(user, function(user) {
                    pool.query("UPDATE person SET password_hash = ?, reset_password_token = NULL WHERE person_id = ?", [user.password_hash, payload.id], function(err) {
                        if(err) {
                            return res.status(500).send("Internal database error (4)");
                        }
                        return res.status(200).send("Password updated");
                })
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
        pool.query(sqlQuery, function(err, result) {
            if(err) {
                res.status(500).send("Error in SQL query");
                return;
            }
            res.status(200).send(result);
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

