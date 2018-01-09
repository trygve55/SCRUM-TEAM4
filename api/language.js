var router = require('express').Router();

router.get('/', function(req, res){
    return "haha";
});

module.exports = function(){
    return "hei";
};//router;