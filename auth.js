var bcrypt = require('bcrypt');

module.exports = {
	hashPassword: function (user, cb) {
		user.hash = bcrypt.hash(user.password, 10, function(err, hash) {
			user.password_hash = hash;
            user.password = null;
            cb(user);
		});
	}
};