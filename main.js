var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var app = express();
require('./mysql');

var auth = require('./auth');

app.use(logger('[:date[web]] ":method :url" :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./api'));

app.get("*", function(req, res){
    res.send(404, "Page not found");
});

app.listen(8000);
console.log("Server listening on port 80");

var user = {password: "test"};

auth.hashPassword(user, function (res) {
    console.log(res);
})

auth.checkLogin("testnavn", "test", function(success){
    if(success) {
        console.log("great sucsess");
    }
});