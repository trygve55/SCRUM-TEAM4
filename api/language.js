/**
 * @module Budget
 */
var router = require('express').Router();
var path = require('path');
var fs = require('fs');

/**
 * Read correct json file in langs and return it the data
 *
 * @name Read correct json file in langs
 * @route {GET} /api/language
 *
 */
router.get('/', function(req, res){
    console.log(req.query);
    var lang = req.session.lang;
    if(!req.query.path && !req.header('referer'))
        return res.status(400).send();
    var pth = req.query.path || req.header('referer').split(":8000")[1];
    if(pth == '/')
        path = '/index.html';
	
    if(!lang){
        req.session.lang = "nb_NO";
        req.session.save();
        lang = "nb_NO";
    }
	// Is the path wrong?
    if(!pth)
        return res.status(400).send("Bad request");
    pth = pth.split('.')[0];
    console.log(__dirname);
    var p = __dirname + '/../langs/' + lang + pth + '.json';

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

var langs = [
    'en_US',
    'nb_NO'
];

/**
 * Set the current users language preferences
 *
 * @name Set the current users language preferences
 * @route {POST} /api/language
 * @bodyparam {string} lang the new language to set for the user
 *
 */
router.post('/', function(req, res){
    var lang = req.body.lang;
    if(!lang || langs.indexOf(lang) == -1)
        return res.status(400).send();
    req.session.lang = lang;
    req.session.save();
    res.status(200).send();
});

module.exports = router;