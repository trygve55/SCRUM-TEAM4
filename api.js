var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/login', require('./api/login'));
router.use('/user', require('./api/user'));
router.use('*', function(req, res, next){
    if(!req.session.person_id)
        return res.status(200).json({redirect: '/login.html'});
    next();
});
router.use('/group', require('./api/group'));
router.use('/shoppingList', require('./api/shoppingList'));
router.use('/currency', require('./api/currency'));
router.use('/tasks', require('./api/tasks'));

module.exports = router;
