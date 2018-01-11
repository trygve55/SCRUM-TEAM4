var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/login', require('./api/login'));
router.use('/group', require('./api/group'));
router.use('/user', require('./api/user'));
router.use('/shoppingList', require('./api/shopping_list'));
router.use('/currency', require('./api/currency'));

module.exports = router;