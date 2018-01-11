var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/group', require('./api/group'));

module.exports = router;