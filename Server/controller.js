var SerialPort = require('serialport');

// Este modulo se encarga de mantener la conexion
// activa con el Controller
// Intenta revivirla si se corta
module.exports = {
	init: function() {
		this.checkSerial();
		
		setInterval(function() {
			// periodic
			
			if(this.serialPort && this.serialPort.isOpen) {
				// esto es un hackazo para detectar la desconexion que a veces no detecta
				this.serialPort.resume();
			}
		}.bind(this), 100);
	},
	checkSerial: function() {
		setTimeout(function() {
			this.checkPorts();
		}.bind(this), 1000);
	},
	// lista los puertos habilitados
	// si encuentra uno intenta conectarse
	// lo ideal seria tener el nro de serie del Arduino Mega
	// para que no se confunda
	checkPorts: function() {
		SerialPort.list().then(function(puertos) {
			if(puertos.length == 0) {
				console.log("No se encontraron puertos serie disponibles");
				this.checkSerial();
			} else {
				var info = "Puertos disponibles: ";
				var target_serial_number = "5&521a615&0&6"; // Este es el numero serial de nuestro Arduino MEGA
				var target_id = -1;
				
				for(var i = 0; i < puertos.length; i++) {
					var puerto = puertos[i];
					if(puerto.serialNumber == target_serial_number)
						target_id = i;
					info += puerto.comName + " ";
				}
				console.log(info);
				
				if(target_id == -1) {
					console.log("No esta conectado un Arduino con el numero serial " + target_serial_number + ".");
					this.checkSerial();
				} else {
					this.connect(puertos[target_id].comName);
				}
			}
		}.bind(this));
	},
	// se conecta a un puerto serie
	// si esta conectado a un puerto actualmente se desconecta
	// establece los callbacks necesarios
	// se llama a onConnect y onClose respectivamente
	// por onDataReceived llegan los datos del Arduino
	connect: function(comName) {
		console.log("Conectando a " + comName + "...");
		
		if(this.serialPort) {
			if(this.serialPort.isOpen)
				this.serialPort.close();
			this.serialPort = null;
		}
		
		this.serialPort = new SerialPort(comName, {
			baudRate: 9600,
			autoOpen: false
		});

		this.serialPort.on('open', function() {
			console.log("Conectado a " + comName + "!");
			this.onConnect();
		}.bind(this));
		this.serialPort.on('close', function(err) {
			console.log("Conexion cerrada a " + comName + ": " + err);
			this.onClose();
			this.checkSerial();
		}.bind(this));
		this.serialPort.on('data', this.onDataReceived);
		
		this.serialPort.open(function(err) {
			if (err) {
				console.log("Error conectando a " + comName + ": " + err);
				this.checkSerial();
			}
		}.bind(this));
	},
	// envia al puerto serial data
	// si no esta abierto no envia nada (y no se llama onDataSend)
	send: function(data) {
		if(this.serialPort && this.serialPort.isOpen) {
			this.serialPort.write(data, function(err){
				if(err) {
					console.log("No se pudo escribir '" + data + "'.");
				} else {
					this.onDataSend(data);
				}
			}.bind(this));
		}
	}
};