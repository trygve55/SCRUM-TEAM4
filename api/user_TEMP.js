var con;

/*
Returns the requested user's data in an array in the following format:
[0] email, [1] forename, [2] middle name, [3] surname, [4] phone number, [5] group_ids[]
 */

function getUserdata(username) {
    var values = [];
    var sql = "SELECT email, forename, middlename, lastname, phone, person_id FROM person WHERE username = ?";
    con.query(sql, [username], function(err, result) {
        if(err) throw err;
        values = result;
    });
    var sqlGroups = "SELECT group_id FROM group_person WHERE person_id = ?";
    con.query(sql,[values[5]], function(err, result) {
        if(err) throw err;
        values[5] = result;
    });
    return values;
}

function getUsername(email) {
    var values;
    var sql = "SELECT username FROM person WHERE email = ?";
    con.query(sql, [email], function(err, result) {
        if(err) throw err;
        var values = result;
    });
    return values;
}