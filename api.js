var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/user', require('./api/user'));

module.exports = router;