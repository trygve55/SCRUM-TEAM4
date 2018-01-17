var router = require('express').Router();
var fs = require('fs');
var path = require('path');

router.get('/', function(req, res){
    if(!req.query.files || req.query.files.length == 0)
        return res.status(400).send();
    var ret = {};
    for(var i = 0; i < req.query.files.length; i++){
        if(req.query.files[i].indexOf(".html") == -1)
            return res.status(400).send();
        ret[req.query.files[i]] = fs.readFileSync(path.join(__dirname, "/public/template/" + req.query.files[i]), {encoding: "UTF-8"});
    }
    res.status(200).json(ret);
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = router;