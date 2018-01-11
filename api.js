var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/login', require('./api/login'));

module.exports = router;