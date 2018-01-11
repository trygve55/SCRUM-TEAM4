var router = require('express').Router();
var auth = require('../auth');

module.exports = router;

router.post('/regUser', function(req, res){
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

                    connection.query('INSERT INTO person ' +
                        '(email, username, password_hash, forename, middlename,' +
                        'lastname, phone, birth_date,' +
                        'gender, profile_pic, shopping_list_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)', values, function(err, result) {
                        if (err) throw err;
                        connection.release();
                        res.json({message: "true"});
                    });
                });
            });
        });
    });
});

router.get('/okUser', function (req, res) {
    var username = req.query.username;

    pool.getConnection(function (err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        if(checkValidUsername(username)){
            return res.status(400);
        }

        connection.query('SELECT COUNT(username) AS counted FROM person WHERE username = ?', [username], function (err, result){
            if(result[0].counted === 1) {
                connection.release();
                return res.status(400);
            } else {
                connection.release();
                return res.status(200);
            }
        });
    });
});

router.get('/okEmail', function (req, res) {
    var email = req.query.email;

    pool.getConnection(function (err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }

        if(checkValidEmail(email)){
            return res.status(400);
        }

        connection.query('SELECT COUNT(email) AS counted FROM person WHERE email = ?', [email], function (err, result){
            if(result[0].counted === 1) {
                connection.release();
                return res.status(400).send("bad request");
            } else {
                connection.release();
                return res.status(200);
            }
        });
    });
});

//returns true if valid
function checkValidUsername(username) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username.toLowerCase());
}
//returns true if valid
function checkValidEmail(email) {
    console.log(email);
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email.toLowerCase());
}



// ---------------------


