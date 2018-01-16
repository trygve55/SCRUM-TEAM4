var router = require('express').Router();

module.exports = router;

router.get('/', function(req, res){
    pool.getConnection(function(err, connection) {
        if(err)
            return res.status(500).json({'Error' : 'connecting to database: ' } + err);
        connection.query('SELECT * FROM currency ORDER BY currency_major DESC, currency_long ASC;', function(err, result) {
            connection.release();
            if(err)
                return res.status(500).json({'Error' : 'connecting to database: ' } + err);

            //svar på GET request
            res.status(200).json(result);
        });
    });
});