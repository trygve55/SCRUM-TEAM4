var router = require('express').Router();

module.exports = router;

router.post('/', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error connecting to database'} + err);
            return;
        }
        console.log('Connected to database');
    });
});


// ---------------------


