var router = require('express').Router();
var bcrypt = require('bcrypt');

module.exports = router;

router.post('/', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {

        var loginVariable, username = req.body.username, password = req.body.password;

        if (username.indexOf("@") == -1) {
            loginVariable = 'username';
        } else {
            loginVariable = 'email';
        }

        pool.getConnection(function (err, connection) {
            connection.query("SELECT person_id, password_hash FROM person WHERE ?? = ?;", [loginVariable, username], function (error, results, fields) {
                connection.release();
                if(err) {
                    res.status(500);
                    res.json({'Error' : 'connecting to database: ' } + err);
                    return;
                }

                bcrypt.compare(password, results[0].password_hash, function(err, hash_res) {
                    console.log("bcrypt" + res);

                    if (hash_res) {
                        console.log("login for person id: " + results[0].person_id);
                        res.status(200);
                        res.json({person_id: results[0].person_id});
                    } else {
                        console.log("Login failed username: " + username);
                        res.status(400).json({error: "login failed"});
                    }
                });
            });
        });
    });
});

router.post('/facebook', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function (err, connection) {
        connection.query("SELECT person_id FROM person WHERE facebook_api_id = ?;", [facebook_api_id], function (error, results, fields) {
            connection.release();
            if(err) {
                res.status(500);
                res.json({'Error' : 'connecting to database: ' } + err);
                return;
            }

            if (results.length == 1) {
                console.log("login for person id: " + results[0].person_id);
                res.status(200);
                res.json({person_id: results[0].person_id});
            } else {
                console.log("Login failed username: " + username);
                res.status(400).json({error: "login failed"});
            }
        });
    });
});