var router = require('express').Router();

router.use('/language', require('./api/language'));

module.exports = router;