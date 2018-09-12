var fs      = require('fs'),
	express = require('express'),
	app     = express(),
	server  = require('http').Server(app),
	io      = require('socket.io')(server);

var Controller = require('./controller.js');
var buffer = [];
var placas_estados = {};
var displays = {
	"150": "huergo compu"
};

function syncThings() {
	console.log("INIT BACK");
	for(var id in displays) {
		var buf = [id, 13]; // 13 es borrar display
		for(var i in displays[id]) {
			buf.push(id);
			buf.push(displays[id].charCodeAt(i));
		}
		Controller.send(buf);
	}
}

Controller.onConnect = function() {
	setTimeout(function() {
		Controller.send([0]);
	}, 1000);
}
Controller.onClose = function() {
	
}
Controller.onDataReceived = function(data) {
	for(var i = 0; i < data.length; i++) {
		buffer.push(data[i]);

		if(data[i] == 199) {
			syncThings();
		}
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
	io.emit('displays', displays);

	socket.on('serial', function (data) {
		Controller.send([parseInt(data.id), parseInt(data.dato)]);
	});
	socket.on('update_display', function (data) {
		console.log("Updated display text ID: " + data.id + ", Text: " + data.text)
		displays[data.id+""] = data.text;
		syncThings();
	});
});

app.get('/', function(req, res) {
	res.render('pages/index.html', {foo:"bar", a:0});
});

Controller.init();
server.listen(8080, function() {
	console.log("Running on http://localhost:8080");
});