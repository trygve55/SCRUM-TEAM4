var router = require('express').Router();

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

        connection.query('SELECT username FROM person WHERE username = ?', [req.body.username], function (err, result) {
            if (err) throw err;
            if (result) console.log('username exists'); //return error
        });

        connection.query('SELECT email FROM person WHERE email = ?', [req.body.email], function (err, result) {
            if (err) throw err;
            if (result) console.log('email already in use'); //return error
        });

        var values = [
            req.body.email,
            req.body.username,
            req.body.password_hash,
            req.body.forename,
            req.body.middlename,
            req.body.lastname,
            req.body.phone_number,
            req.body.birth_day,
            req.body.is_verified,
            req.body.gende,
            req.body.profile_pic
        ];

        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!emailRegex.test(values['req.body.email'])) throw err;

        connection.query('INSERT INTO person ' +
            '(email, username, password_hash, forename, middlename,' +
            'lastname, phone_number, birth_day, is_verified,' +
            'gender, profile_pic) VALUES(?,?,?,?,?,?,?,?,?,?,?)', values, function(err, result) {
            if (err) throw err;
            if (result) console.log(result);
            connection.release();
        });
    });
});


// ---------------------


