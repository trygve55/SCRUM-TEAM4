var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/login', require('./api/login'));
router.use('/imageUpload', require('./api/imageUpload'));

module.exports = router;