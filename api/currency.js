var router = require('express').Router();

module.exports = router;

router.get('/currencies', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }
        console.log('Connected to database');

        connection.query('SELECT INTO shopping_list ' +
            '(shopping_list_name) VALUES (?)', [req.body.shopping_list_name], function(err, result) {
            if (err) throw err;
            if (result) console.log(result);
            connection.release();

            //svar på post request
            res.json({message: "true"});
        });
    });
});


// ---------------------


