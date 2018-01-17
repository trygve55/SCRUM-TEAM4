var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/auth', require('./api/auth'));
router.use('/user', require('./api/user'));
router.use('/group', require('./api/group'));
router.use('/shoppingList', require('./api/shoppingList'));
router.use('/currency', require('./api/currency'));
router.use('/tasks', require('./api/tasks'));
router.use('/news', require('./api/news'));

module.exports = router;
