var fs      = require('fs'),
	express = require('express'),
	app     = express(),
	server  = require('http').Server(app),
	io      = require('socket.io')(server);

var Controller = require('./controller.js');
var buffer = [];
var placas_estados = {};

Controller.onConnect = function() {
	Controller.send([199]);
}
Controller.onClose = function() {
	
}
Controller.onDataReceived = function(data) {
	for(var i = 0; i < data.length; i++) {
		buffer.push(data[i]);
	}
	
	while(buffer.length >= 2) {
		var id = buffer.shift();
		
		if(id >= 200) {
			var estado = buffer.shift();
			placas_estados[id] = estado == 76;
			console.log(id + ":" + estado);
			io.emit('serial', { direction: 'received', data: [id, estado] });
			io.emit('estado', placas_estados);
		}
	}
	console.log("Recibido: " + data);
}
Controller.onDataSend = function(data) {
	io.emit('serial', { direction: 'sended', data: data });
	
	console.log("Enviado: " + data);
}


app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);

io.on('connection', function (socket) {
	// un usuario se conecto por WebSockets
	io.emit('estado', placas_estados);

	socket.on('serial', function (data) {
		Controller.send([parseInt(data.id), parseInt(data.dato)]);
	});
});

app.get('/', function(req, res) {
	res.render('pages/index.html', {foo:"bar", a:0});
});

Controller.init();
server.listen(8080, function() {
	console.log("Running on http://localhost:8080");
});