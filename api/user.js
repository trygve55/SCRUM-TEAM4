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

router.get('/okEmail', function (req, res) {

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
            } else {
                connection.release();
                res.status(200).send("OK");
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
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email.toLowerCase());
}



// ---------------------


