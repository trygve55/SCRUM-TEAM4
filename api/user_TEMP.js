var router = require('express').Router();

module.exports = router;

/*
Returns the requested user's data in an array in the following format:
[0] email, [1] forename, [2] middle name, [3] surname, [4] phone number, [5] group_ids[]
TODO test that group_ids are added properly
 */

router.post('/getUser', function(req, res) { // TODO add authentication
    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({"error:": "Error connecting to database" + err});
            return;
        }
        var values = ['empty'];
        var sql = "SELECT email, forename, middlename, lastname, phone, person_id FROM person WHERE username = ?";
        connection.query(sql, [req.body.username], function(err, result) {
            if(err) throw err;
            values = result;

            sql = "SELECT group_id FROM group_person WHERE person_id = ?";
            connection.query(sql,[values[5]], function(err, result) {
                if(err) throw err;
                delete values.person_id;
                values.group_ids = result;
                res.send(values);
            });
        });
    });
});

router.post('/setupTestPerson', function(req, res) {
    pool.getConnection(function(err, connection) {
        if(err) throw err;
        deleteTestPerson(connection);
        insertTestPerson(connection);
        res.send('Test person set up');
    });
});

function getUsername(email, con) {
    var values;
    var sql = "SELECT username FROM person WHERE email = ?";
    con.query(sql, [email], function(err, result) {
        if(err) throw err;
        var values = result;
    });
    return values;
}

function insertTestPerson(connection) {
    console.log('insertTestPerson() called');
    var binary = 0x01010100010001010101001101010100;
    var data = [['TEST_EMAIL','TEST_USERNAME_M',binary, 'TEST_FORENAME','TEST_SURNAME','TEST_PHONE','1970-01-01',
        0x0,0,0]];
    var sql = 'INSERT INTO person (email, username, password_hash, forename, lastname, phone, birth_date, ' +
        'is_verified, gender, shopping_list_id) VALUES ?';
    connection.query(sql, [data], function(err, result) {
        if(err) {
            console.log('An error occurred!');
            throw err;
        } else {
            console.log('query succesfully sent');
        }
    });
    var personid;
    connection.query('SELECT LAST_INSERT_ID()', function(err, result) {
        if(err) throw err;
        personid = result;
    });
    return personid;
}
function deleteTestPerson(connection) {
    connection.query("DELETE FROM person WHERE username = 'TEST_USERNAME_M'", function(err, result) {
        if(err) throw err;
    });
}