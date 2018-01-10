var router = require('express').Router();
var path = require('path');
var fs = require('fs');

router.get('/', function(req, res){
    var lang = req.query.lang;
    var pth = req.query.path;
    if(!lang || !pth){
        res.status(400).send("Bad request");
        return;
    }
    pth = pth.split('.')[0];
    var p = path.join(__dirname, '../langs/' + lang + pth + '.json');
    if(!fs.existsSync(p)){
        res.status(400).send("Non existing translation");
        return;
    }
    var stat = fs.statSync(p);

    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(p);
    readStream.pipe(res);
});

module.exports = router;