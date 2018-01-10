var bcrypt = require('bcrypt');
var mysql = require('mysql');

module.exports = {
	hashPassword: function (user, cb) {
		user.hash = bcrypt.hash(user.password, 10, function(err, hash) {
			user.password_hash = hash;
            user.password = null;
            cb(user);
		});
	},
	checkLogin: function (username, password, cb) {

        var inserts, sql = "SELECT password_hash FROM person WHERE ?? = ?;";

		if (username.indexOf("@") == -1) {
            inserts = ['username' , username];
		} else {
            inserts = ['email' , username];
		}

        sql = mysql.format(sql, inserts);

        pool.getConnection(function (err, connection) {
            connection.query(sql, function (error, results, fields) {
                connection.release();

                bcrypt.compare(password, results[0].password_hash, function(err, res) {
                	cb(res);
				});

                if (error) throw error;
            });
        });

	}
};
