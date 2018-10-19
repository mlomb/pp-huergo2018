var exec = require('child_process').exec;
const request = require("request");
const fs = require("fs");
var uri = 'rtsp://192.168.23.145/live.sdp';

module.exports = {
	getPatente: function(callback){
		String.prototype.replaceAll = function(search, replacement) {
			var target = this;
			return target.replace(new RegExp(search, 'g'), replacement);
		};
		var path = "/home/pi/Desktop/pp-huergo2018/Server/public/patentes-imgs/";
		var name = new Date().toISOString().replaceAll(':','-')+".jpg";
		var img = path +  name;
		
		exec("ffmpeg -rtsp_transport tcp -i " + uri + " -vframes 1 -stimeout 3000000 -s 640x480 " +img, (error, stdout, stderr) => {
			if(error) throw error;
			request.post({
				url: 'https://api.openalpr.com/v2/recognize?recognize_vehicle=0&country=ar&secret_key=sk_80f913bc8c14b62028bcfd63',
				formData: {
					image: fs.createReadStream(img)
				}
			}, function(err, httpResponse, body) {
				if (err) throw err;
				var obj = JSON.parse(body);
				var data = {
					patente: null,
					image: name
				};
				if(obj.results.length >= 1) {
					data.patente = obj.results[0].plate;
				}
				callback(data);
			});

		});
	}
}