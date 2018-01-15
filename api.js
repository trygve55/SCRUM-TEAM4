var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/login', require('./api/login'));
router.use('*', function(req, res, next){
    console.log(req.method);
    if(!req.session.person_id && (req.originalUrl !== '/api/user/register' || (req.method !== "POST" && req.originalUrl === '/api/user/register')))
        return res.status(500).send();
    next();
});
router.use('/group', require('./api/group'));
router.use('/user', require('./api/user'));
router.use('/shoppingList', require('./api/shoppingList'));
router.use('/currency', require('./api/currency'));

module.exports = router;
