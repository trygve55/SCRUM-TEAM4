var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/budget', require('./api/budget'));

module.exports = router;