var fs      = require('fs'),
	express = require('express'),
	app     = express(),
	server  = require('http').Server(app),
	io      = require('socket.io')(server),
	mysql   = require('mysql');

var datos = require('./../datos.json');

var Controller = require('./controller.js');
var buffer = [];
var placas_estados = {};
var utilities_estados = {
	"160": { "bulb": false, "fan": false, "alarm": false }
};
var displays = {
	"150": "huergo compu"
};
var panico = {
	id: 0
};

var pool = mysql.createPool(datos.database);

function syncDatabase() {
	pool.query("UPDATE slots SET state='OCUPADO'", function (error, results, fields) {
		if (error) throw error;
		var c = Object.keys(placas_estados).length;
		if(c == 0) {
			setTimeout(syncDatabase, 500);
			return;
		}
		for(var id in placas_estados) {
			pool.query('UPDATE slots SET state=? WHERE id=?', [placas_estados[id] ? 'LIBRE' : 'OCUPADO' , id], function (error, results, fields) {
				if (error) throw error;
				c--;
				if(c <= 0) {
					setTimeout(syncDatabase, 500);
				}
			});
		}
	});
}
function syncReservas() {
	pool.query("SELECT * FROM reservas WHERE NOW() BETWEEN entrada AND salida", function (error, results, fields) {
		if (error) throw error;
		var reservas_estados = {};
		for(var id in placas_estados)
			reservas_estados[id] = 'n';
		
		if(panico.id != 0) {
			for(var id in placas_estados)
				reservas_estados[id] = 'a';
		} else {
			for(var i in results) {
				reservas_estados[results[i].slot] = 'r';
			}
		}
		
		var buf = [];
		for(var id in reservas_estados) {
			buf.push(id);
			buf.push(reservas_estados[id].charCodeAt(0));
			console.log(id + ": " + reservas_estados[id].charCodeAt(0));
		}
		if(buf.length > 0)
			Controller.send(buf);
		
		setTimeout(syncReservas, 5000);
	});
}

function syncUtilities() {
	io.emit('utilities', utilities_estados);
	io.emit('panico', panico);
	for(var id in utilities_estados) {
		Controller.send([ id, utilities_estados[id]["bulb"] ? 10 : 11 ]);
		Controller.send([ id, utilities_estados[id]["fan"] ? 20 : 21 ]);
		Controller.send([ id, utilities_estados[id]["alarm"] ? 30 : 31 ]);
	}
}
function syncThings() {
	io.emit('estado', placas_estados);
	console.log("INIT BACK");
	for(var id in displays) {
		var buf = [id, 13]; // 13 es borrar display
		for(var i in displays[id]) {
			buf.push(id);
			buf.push(displays[id].charCodeAt(i));
		}
		Controller.send(buf);
	}
	syncUtilities();
}

Controller.onConnect = function() {
	setTimeout(function() {
		Controller.send([0]);
	}, 1000);
}
Controller.onClose = function() {
	
}
Controller.onDataReceived = function(data) {
	console.log("Recibido: " + data);
	
	for(var i = 0; i < data.length; i++) {
		buffer.push(data[i]);

		if(data[i] == 199) {
			syncThings();
		}
	}
	
	while(buffer.length >= 2) {
		var id = buffer.shift();
		
		var valid = false;
		
		if(id >= 200) {
			valid = true;
			
			var estado = buffer.shift();
			placas_estados[id] = estado == 76;
		} else if((id+"") in utilities_estados) {
			valid = true;
			
			var pulsado = buffer.shift();
			if(pulsado == 83) {
				panico.id = parseInt(id);
				console.log("BOTON DE PANICO #" + id + " PRESIONADO");
				toggleAllUtilities("bulb", true);
				toggleAllUtilities("alarm", true);
				syncUtilities();
			}
		}
		
		if(valid) {
			//console.log(id + ":" + estado);
			io.emit('serial', { direction: 'received', data: [id, estado] });
			io.emit('estado', placas_estados);
		}
	}
}
Controller.onDataSend = function(data) {
	io.emit('serial', { direction: 'sended', data: data });
	
	console.log("Enviado: " + data);
}

function toggleAllUtilities(name, active) {
	for(var id in utilities_estados) {
		utilities_estados[id][name] = active;
	}
}


app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);

io.on('connection', function (socket) {
	// un usuario se conecto por WebSockets
	io.emit('estado', placas_estados);
	io.emit('utilities', utilities_estados);
	io.emit('displays', displays);

	socket.on('serial', function (data) {
		Controller.send([parseInt(data.id), parseInt(data.dato)]);
	});
	socket.on('update_display', function (data) {
		console.log("Updated display text ID: " + data.id + ", Text: " + data.text)
		displays[data.id+""] = data.text;
		syncThings();
	});
	socket.on('bulb', function (data) {
		var i = data.id+"";
		if(!(i in utilities_estados)) return;
		utilities_estados[i]["bulb"] = !utilities_estados[i]["bulb"];
		syncUtilities();
	});
	socket.on('fan', function (data) {
		var i = data.id+"";
		if(!(i in utilities_estados)) return;
		utilities_estados[i]["fan"] = !utilities_estados[i]["fan"];
		syncUtilities();
	});
	socket.on('bulbs', function (active) {
		toggleAllUtilities("bulb", active);
		syncUtilities();
	});
	socket.on('fans', function (active) {
		toggleAllUtilities("fan", active);
		syncUtilities();
	});
	socket.on('stop_panic', function (active) {
		toggleAllUtilities("alarm", false);
		panico.id = 0;
		syncUtilities();
	});
});

app.get('/', function(req, res) {
	res.render('pages/index.html', {foo:"bar", a:0});
});

Controller.init();
syncDatabase();
syncReservas();
server.listen(8080, function() {
	console.log("Running on http://localhost:8080");
});