var router = require('express').Router();

router.use(function(req, res, next){
    if(!req.session.person_id){
        req.session.person_id = 4;
        req.session.save();
    }
    next();
});

router.use('/language', require('./api/language'));
router.use('/login', require('./api/login'));
router.use('/user', require('./api/user'));
router.use('/group', require('./api/group'));
router.use('/shoppingList', require('./api/shoppingList'));
router.use('/currency', require('./api/currency'));
router.use('/tasks', require('./api/tasks'));

module.exports = router;
