var router = require('express').Router();
var bcrypt = require('bcrypt');

module.exports = router;

router.post('/', function(req, res){
    console.log('POST-request established');

    var loginVariable, username = req.body.username, password = req.body.password;

    if (!username || !password) {
        res.status(400).json({login: false, error: "login failed"});
        return;
    }

    pool.getConnection(function(err, connection) {

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
                        req.session.person_id = results[0].person_id;
                        req.session.save();
                        res.status(200).json({login: true, person_id: results[0].person_id});

                    } else {
                        console.log("Login failed username: " + username);
                        res.status(400).json({login: false, error: "login failed"});
                    }
                });
            });
        });
    });
});

router.get('/', function(req, res) {
    console.log('GET-request established');
    console.log("Login check");
    console.log(req.session);
    res.status(200).json({login: !!req.session.person_id});
});

router.post('/facebook', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function (err, connection) {
        connection.query("SELECT person_id FROM person WHERE facebook_api_id = ?;", [req.body.facebook_api_id], function (error, results, fields) {
            connection.release();
            if(err) {
                res.status(500);
                res.json({'Error' : 'connecting to database: ' } + err);
                return;
            }

            if (results.length == 1) {
                console.log("login for person id: " + results[0].person_id);
                req.session.person_id = results[0].person_id;
                req.session.save();
                console.log(req.session);
                res.status(200).json({login: true, person_id: results[0].person_id});
            } else {
                console.log("Login failed username: " + req.body.facebook_api_id);
                res.status(400).json({login: false, error: "login failed"});
            }
        });
    });
});

router.post('/logout', function(req, res) {
   console.log("logout");
   req.session.destroy();
   res.status(200).json({login: false});
});