var router = require('express').Router();

module.exports = router;

/*
Returns the requested information about the requested users. The request body must contain two variables: req.body.variables and
req.body.users, both arrays. The first one is a list of the variables you'd like to retrieve, while the second is a list of
user IDs for which you'd like to retrieve those variables' data.
Sensitive data variables are only available to the current session's user.

Variables available to all logged in users:
username, forename, middlename, lastname, gender, profile_pic, profile_pic_tiny and last_active
Variables available to users about themselves:
email, phone, birth_date, is_verified, shopping_list_id, user_language, user_deactivated, facebook_api_id

Example 1: the client needs to know the full names, gender, and profile_pic_tiny (all public) of some person_ids
Request body:
{
    variables: ['forename', 'middlename', 'lastname', 'gender', 'profile_pic_tiny'],
    users: [309, 482, 100, 2]
}

Example 2: the client needs to know the email, phone, and user_language of the currently logged in user
Request body:
{
    variables: ['email', 'phone', 'user_language'],
    users: [300]
}
If the session ID stored on the server matches the requested user's ID, the info is provided. If it does not, or more
than one ID is provided in the req.body.users, the server will respond with a 403 Forbidden status code, since the
info is only available to the user with the ID 300, when they are logged in.
 */

var publicVars = ['username', 'forename', 'middlename', 'lastname', 'gender', 'profile_pic',
    'profile_pic_tiny', 'last_active'];
var privateVars = ['email', 'phone', 'birth_date', 'is_verified', 'shopping_list_id', 'user_language',
    'user_deactivated', 'facebook_api_id'];

function reqForPrivateVars(reqVars) {
    var result = false;
    reqVars.forEach(function(element) {
        if(privateVars.indexOf(element) > -1) {
            result = true;
            return;
        }
    });
    return result;
}

router.post('/getUser', function(req, res) { // TODO add authentication
    if(!req.session.person_id || checkRequestArray(req.body.variables) > 0 ||
        (reqForPrivateVars(req.body.variables) && (req.body.users.length > 1 || req.session.person_id != req.body.users[0]))) {
            return res.status(403).send("Forbidden request");
    }
    console.log('API: authentication passed');
    var sqlQuery = 'SELECT ?';
    for(i = 1; i < req.body.variables.length; i++) {
        sqlQuery += ',?';
    }
    sqlQuery += ' FROM person WHERE person_id = ?';
    for(i = 1; i < req.body.users.length; i++) {
        sqlQuery += ' OR person_id = ?';
    }
    var values = req.body.variables;
    req.body.users.forEach(function(element) {
        values.push(element);
    });

    pool.getConnection(function(err, connection) {
        if(err) {
            res.status(500);
            res.json({"error": "Error connecting to database" + err});
            return;
        }

        connection.query(sqlQuery, values, function(err, result) {
            if(err) {
                res.status(500);
                res.json({"error": "Error in query to database" + err});
                return;
            }
            res.status(200);
            res.send(result);
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

function checkRequestArray(inputArray) {
    var validInput = ['person_id', 'email', 'username',
        'forename', 'middlename',
        'lastname', 'phone', 'birth_date', 'is_verified',
        'gender', 'profile_pic', 'profile_pic_tiny',
        'last_active', 'shopping_list_id',
        'user_language', 'user_deactivated', 'facebook_api_id'];
    var errors = 0;
    inputArray.forEach(function(element) {
        if(validInput.indexOf(element) < 0) errors++;
    });
    return errors;
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