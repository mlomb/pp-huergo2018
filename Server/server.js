var fs      = require('fs'),
	express = require('express'),
	app     = express(),
	server  = require('http').Server(app),
	io      = require('socket.io')(server);

var Controller = require('./controller.js');
var buffer = [];
var placas_estados = {};

Controller.onConnect = function() {
	Controller.send("hello");
}
Controller.onClose = function() {
	
}
Controller.onDataReceived = function(data) {
	io.emit('serial', { direction: 'received', data: data.toString('utf8') });
	
	for(var i = 0; i < data.length; i++) {
		buffer.push(data[i]);
	}
	
	while(buffer.length >= 2) {
		var id = buffer.shift();
		
		if(id >= 200) {
			var estado = buffer.shift();
			placas_estados[id] = estado == 76;
			console.log(id + ":" + estado);
			io.emit('estado', placas_estados);
		}
	}
	//console.log("Recibido: " + data);
}
Controller.onDataSend = function(data) {
	io.emit('serial', { direction: 'sended', data: data.toString('utf8') });
	
	console.log("Enviado: " + data);
}


app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);

io.on('connection', function (socket) {
	// un usuario se conecto por WebSockets
	io.emit('estado', placas_estados);
	socket.emit('event_name', { hello: 'world' });
	socket.on('event_name', function (data) {
		console.log(data);
	});
});

app.get('/', function(req, res) {
	res.render('index.html', {foo:"bar", a:0});
});

Controller.init();
server.listen(8080, function() {
	console.log("Running on http://localhost:8080");
});