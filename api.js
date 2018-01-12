var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/login', require('./api/login'));
<<<<<<< HEAD
router.use('/group', require('./api/group'));
=======
router.use('/imageUpload', require('./api/imageUpload'));
>>>>>>> fileUpload

module.exports = router;