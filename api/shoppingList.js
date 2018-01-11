var router = require('express').Router();

module.exports = router;

router.post('/createShoppingList', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }
        console.log('Connected to database');

        var shopping_list = req.body;

        var values = [
            shopping_list.shopping_list_name,
            shopping_list.spesific_currency
        ];

        connection.query('INSERT INTO shopping_list ' +
            '(shopping_list_name, specific_currency) VALUES (?,?)', values, function(err, result) {
            connection.release();

            if(err) {
                res.status(500);
                res.json({'Error' : 'connecting to database: ' } + err);
                return;
            }
            if (result) console.log(result);

            //svar på post request
            res.json({success: "true", shopping_list_id: result});
        });
    });
});

router.post('/editShoppingListName', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }
        console.log('Connected to database');

        connection.query('UPDATE shopping_list ' +
            'SET VALUES shopping_list_name = ? WHERE shopping_list_id = ?;', [req.body.shopping_list_name, req.body.shopping_list_name], function(err, result) {
            connection.release();

            if(err) {
                res.status(500);
                res.json({'Error' : 'connecting to database: ' } + err);
                return;
            }
            if (result) console.log(result);

            //svar på post request
            res.json({success: "true"});
        });
    });
});

router.post('/setShoppingListCurrency', function(req, res){
    console.log('POST-request established');
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({'Error' : 'connecting to database: ' } + err);
            return;
        }
        console.log('Connected to database');

        connection.query('UPDATE shopping_list ' +
            'SET VALUES currency_id = ? WHERE shopping_list_id = ?;', [req.body.shopping_list_name, req.body.shopping_list_name], function(err, result) {
            connection.release();

            if(err) {
                res.status(500);
                res.json({'Error' : 'connecting to database: ' } + err);
                return;
            }

            if (result) console.log(result);

            //svar på post request
            res.json({success: "true"});
        });
    });
});


// ---------------------



router.post('/addItemToList', function(req, res){
	var data = req.body;
	
	var entryText = data.entryText;
	var addedByPerson_id = req.session.person_id;	// This might be incorrect as this variable is not decided at this time.
	var cost = data.cost;
	var datetimeAdded = new Date();
	
	var datetimePurchased;
	var purchasedByPersonId;
	
	if (data.purchasedByPersonId) {purchasedByPersonId = data.purchased_by_person_id}
	if (data.datetimePurchased) {datetimePurchased = data.datetime_purchased;}
	
	console.log('POST-request initiating');
	pool.getConnection(function(err, connection) {
		if(err) {
			res.status(500);
			res.json({'Error' : 'connecting to database: ' } + err);
			return;
		}
		console.log('Connection to database established');

		connection.query('INSERT INTO shopping_list ' + '(specific_currency) VALUES (?)', [shopping_list_currency], function(err, result) {
			if (err) throw err;
			if (result) console.log(result);
			connection.release();

			//svar på post request
			res.json({message: "true"});
		});
	});
});
