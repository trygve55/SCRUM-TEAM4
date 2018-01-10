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

        var user = req.body;

        var emailRegex = new RegExp('/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/');
        if(!emailRegex.test(user[user.email])) throw err;

        connection.query('SELECT username FROM person WHERE username = ?', [user.username], function (err, result) {
            if (err) throw err;
            if (result) console.log('username exists'); //return error

            connection.query('SELECT email FROM person WHERE email = ?', [user.email], function (err, result) {
                if (err) throw err;
                if (result) console.log('email already in use'); //return error

                var values = [
                    user.email,
                    user.username,
                    user.password,
                    user.forename,
                    user.middlename,
                    user.lastname,
                    user.phone_number,
                    user.birth_day,
                    user.is_verified,
                    user.gender,
                    user.profile_pic
                ];

                connection.query('INSERT INTO person ' +
                    '(email, username, password_hash, forename, middlename,' +
                    'lastname, phone_number, birth_day, is_verified,' +
                    'gender, profile_pic) VALUES(?,?,?,?,?,?,?,?,?,?,?)', values, function(err, result) {
                    if (err) throw err;
                    if (result) console.log(result);
                    connection.release();

                    //svar på post request
                    //res.
                });
            });
        });
    });
});


// ---------------------


