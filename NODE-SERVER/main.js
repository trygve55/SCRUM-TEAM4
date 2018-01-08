var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var app = express();

<<<<<<< HEAD
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  
app.start = app.listen = function(){
	return server.listen.apply(server, arguments)
}

app.start(80);
console.log("Server started on port 80");

app.use(bodyParser.urlencoded({ extended: false }));
=======
>>>>>>> 35305fd316b848becbf0f6e5d4e5d081fed7954a
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('[:date[web]] ":method :url" :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("*", function(req, res){
    res.send(404, "Page not found");
});

app.listen(80);
console.log("Server listening on port 80");