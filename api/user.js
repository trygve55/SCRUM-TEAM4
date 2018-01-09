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

        var username = req.body.username;

        connection.query('SELECT username FROM person WHERE username = ?', [username], function (err, result) {
            if(err) throw err;
            if (result) console.log('username exists'); //restrn error
        });
        connection.query('SELECT email FROM person WHERE email = ?', [req.body.email], function (err, result) {
            if(err) throw err;
            if (result) console.log('email already in use'); /restrn error
        });

        connection.query('intert into', values, )
    });
});


// ---------------------


