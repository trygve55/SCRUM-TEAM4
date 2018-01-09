var router = require('express').Router();
var path = require('path');
var fs = require('fs');

router.get('/', function(req, res){
    var lang = req.query.lang;
    var pth = req.query.path;
    pth = pth.split('.')[0];
    var p = path.join(__dirname, '../langs/' + lang + pth + '.json');
    var stat = fs.statSync(p);

    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(p);
    readStream.pipe(res);
});

module.exports = router;