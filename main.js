var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var http = require('http');
var app = express();
require('./mysql');

app.use(logger('[:date[web]] ":method :url" :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "something cool",
    resave: true,
    saveUnitialized: false,
    cookie: {
        secure: true
    }
}));

app.use('/api', require('./api'));

app.get("*", function(req, res){
    res.send(404, "Page not found");
});

http.createServer(app).listen(8000);
console.log("Server listening on port 8000");

module.exports = app;