/**
 * @module Currency API
 */
var router = require('express').Router();

module.exports = router;

/**
 * Get all the currencies correctly sorted
 *
 * @name All currencies sorted
 * @route {GET} /api/currency
 *
 */
router.get('/', function(req, res){
    pool.query('SELECT * FROM currency ORDER BY currency_major DESC, currency_long ASC;', function(err, result) {
		if(err)
			return res.status(500).json({'Error' : 'connecting to database: ' } + err);
		res.status(200).json(result);
    });
});