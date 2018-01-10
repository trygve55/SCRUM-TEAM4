var router = require('express').Router();

module.exports = router;

router.post('/searchUser', function(req, res){
	var search = req.body.searchString;
	console.log('Searching for ' + search);
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({'Error' : 'connecting to database: ' } + err);
			return;
		}
		console.log('Connected to database');
		connection.query(
			"SELECT DISTINCT person_id FROM person WHERE CONCAT(email, username, forename, lastname) LIKE CONCAT('%', ?,'%')",
			[search],
			function (err, result) {
				if (err) {throw err;}
				if (result) {res.json{result};} //return resulting person id.
		});
	});
});