var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/shoppingList', require('./api/shopping_list'));

module.exports = router;