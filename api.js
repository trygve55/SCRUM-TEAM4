var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/shoppingList', require('./api/shopping_list'));
router.use('/currency', require('./api/currency'));

module.exports = router;