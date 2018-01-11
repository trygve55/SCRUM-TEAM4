var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
require('./mysql');

var auth = require('./auth');

app.use(logger('[:date[web]] ":method :url" :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "something cool",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));

app.use('/api', require('./api'));

app.get("*", function(req, res){
    res.status(404).send("Page not found");
});

module.exports = app;
