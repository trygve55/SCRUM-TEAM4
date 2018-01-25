var router = require('express').Router();

router.use('/language', require('./api/language'));
router.use('/auth', require('./api/auth'));

router.use('*', function(req, res, next){
    var excludes = [
        'register',
        'forgottenPasswordEmail',
        'forgottenPasswordReset',
        'verifyAccount',
        'mail',
        'user'
    ];
    if(!req.session.person_id && excludes.indexOf(req.url) > -1 && req.originalUrl.indexOf('/api/user') > -1)
        return res.status(403).send();
    next();
});

router.use('/user', require('./api/user'));
router.use('/group', require('./api/group'));
router.use('/shoppingList', require('./api/shoppingList'));
router.use('/currency', require('./api/currency'));
router.use('/tasks/private', require('./api/tasksPrivate'));
router.use('/tasks', require('./api/tasks'));
router.use('/budget', require('./api/budget'));
router.use('/news', require('./api/news'));
router.use('/notify', require('./api/notify'));
router.use('/recipe', require('./api/recipe'));

module.exports = router;
