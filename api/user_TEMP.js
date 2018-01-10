var router = require('express').Router();

module.exports = router;

/*
Returns the requested user's data in an array in the following format:
[0] email, [1] forename, [2] middle name, [3] surname, [4] phone number, [5] group_ids[]
 */

router.post('/getUser', function(req, res) { // TODO add authentication
    console.log('Got POST request');
    pool.getConnection(function(err, connection) {
        if(err) throw err;

        var values = [];
        var sql = "SELECT email, forename, middlename, lastname, phone, person_id FROM person WHERE username = ?";
        connection.query(sql, [req.body.username], function(err, result) {
            if(err) throw err;
            values = result;
        });
        sql = "SELECT group_id FROM group_person WHERE person_id = ?";
        connection.query(sql,[values[5]], function(err, result) {
            if(err) throw err;
            values[5] = result;
        });

        res.send(values);
    });
});

function getUserdata(username, connection) {
    var con;
    var sql = "SELECT email, forename, middlename, lastname, phone, person_id FROM person WHERE username = ?";
    con.query(sql, [username], function(err, result) {
        if(err) throw err;
        values = result;
    });
    var sqlGroups = "SELECT group_id FROM group_person WHERE person_id = ?";
    connection.query(sql,[values[5]], function(err, result) {
        if(err) throw err;
        values[5] = result;
    });
    var values = [];

    return values;
}

function getUsername(email, con) {
    var values;
    var sql = "SELECT username FROM person WHERE email = ?";
    con.query(sql, [email], function(err, result) {
        if(err) throw err;
        var values = result;
    });
    return values;
}