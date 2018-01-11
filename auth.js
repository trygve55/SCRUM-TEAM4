var bcrypt = require('bcrypt');
var mysql = require('mysql');

module.exports = {
	hashPassword: function (user, cb) {
		user.hash = bcrypt.hash(user.password, 10, function(err, hash) {
			user.hash = hash;
            user.password = null;
            cb(user);
		});
	}
};