var router = require('express').Router();
var bcrypt = require('bcrypt');

module.exports = router;

router.post('/logout', function(req, res) {

    req.session.destroy();
    res.status(200).json({login: false});
});

router.post('/', function(req, res){


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


                    if (hash_res) {

                        req.session.person_id = results[0].person_id;
                        req.session.save();
                        res.status(200).json({login: true, person_id: results[0].person_id});

                    } else {

                        res.status(400).json({login: false, error: "login failed"});
                    }
                });
            });
        });
    });
});

router.get('/', function(req, res) {



    res.status(200).json({login: !!req.session.person_id});
});

router.post('/facebook', function(req, res){

    pool.getConnection(function (err, connection) {
        connection.query("SELECT person_id FROM person WHERE facebook_api_id = ?;", [req.body.facebook_api_id], function (error, results, fields) {
            if(err) {
                res.status(500).json({'Error' : 'connecting to database: ' } + err);
                return;
            }
            if (results.length == 1) {
                connection.release();

                req.session.person_id = results[0].person_id;
                req.session.save();

                res.status(200).json({login: true, person_id: results[0].person_id});
            } else {
                connection.beginTransaction(function(err){
                    if(err)
                        return res.status(500).send("Error");
                    connection.query("INSERT INTO shopping_list (currency_id) VALUES (?)", [100], function(err, result){
                        if (err)
                            return res.status(500).json({'error': 'connecting to database'} + err);
                        var values = [
                            req.body.email,
                            req.body.facebook_api_id,
                            req.body.forename,
                            req.body.lastname,
                            result.insertId,
                            req.body.facebook_api_id
                        ];
                        connection.query('INSERT INTO person ' +
                            '(email, username, forename,' +
                            'lastname, shopping_list_id, facebook_api_id) VALUES (?,?,?,?,?,?)', values, function(err, result) {
                            connection.query('SELECT person_id FROM person WHERE facebook_api_id = ?', [req.body.facebook_api_id], function(err, result){
                                if(err)
                                    return res.status(500).send("Fail");
                                req.session.person_id = result[0].person_id;
                                req.session.save();
                                connection.commit(function(err){
                                    if(err)
                                        return connection.rollback(function(err){
                                            if(err)
                                                console.error(err);
                                            res.status(500).send("Transaction fail");
                                        });
                                    res.status(200).send(true);
                                });
                            });
                        });
                    });
                });
            }
        });
    });
});