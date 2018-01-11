var router = require('express').Router();
var formidable = require('formidable'),
    fs = require('fs'),
    path = require('path');


module.exports = router;

router.post('/', function(req, res){
    console.log('POST-request established');

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        console.log(files);

        //res.status(200).json(files);

        //return;

        var old_path = files.file.path,
            file_size = files.file.size,
            index = old_path.lastIndexOf('/') + 1;

        console.log("Reading file");

        fs.readFile(old_path, function (err, data) {

            console.log("connecting");

            pool.getConnection(function (err, connection) {

                console.log("uploading");

                connection.query("UPDATE person SET profile_pic = ? WHERE person_id = 1;", [data], function (error, results, fields) {

                    console.log("uploading2");
                    connection.release();
                    if (err) {
                        res.status(500);
                        res.json({'Error': 'connecting to database: '} + err);
                        return;
                    }

                    res.status(200).json(results);
                });
            });
        });
    });

    return;

    pool.getConnection(function(err, connection) {

        pool.getConnection(function (err, connection) {
            connection.query("SELECT person_id, password_hash FROM person WHERE ?? = ?;", [loginVariable, username], function (error, results, fields) {
                connection.release();
                if(err) {
                    res.status(500);
                    res.json({'Error' : 'connecting to database: ' } + err);
                    return;
                }

                bcrypt.compare(password, results[0].password_hash, function(err, hash_res) {
                    console.log("bcrypt" + res);

                    if (hash_res) {
                        console.log("login for person id: " + results[0].person_id);
                        req.session.person_id = results[0].person_id;
                        req.session.save();
                        res.status(200).json({login: true, person_id: results[0].person_id});

                    } else {
                        console.log("Login failed username: " + username);
                        res.status(400).json({login: false, error: "login failed"});
                    }
                });
            });
        });
    });
});