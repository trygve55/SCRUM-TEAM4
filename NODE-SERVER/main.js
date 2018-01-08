var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = require('express')()
  , server = require('http').createServer(app);
  
app.start = app.listen = function(){
	return server.listen.apply(server, arguments)
}

app.start(80);
console.log("Server started on port 80");

app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Hello World!');
});


