var bcrypt = require('bcrypt');
var mysql = require('mysql');

module.exports = {
	hashPassword: function (user, cb) {
		if(!user.password || user.password.length > 4)
			console.log( "user.password not defined!"); //TODO how to fix this?
		user.hash = bcrypt.hash(user.password, 10, function(err, hash) {
			user.password_hash = hash;
            user.password = null;
            cb(user);
		});
	}
};