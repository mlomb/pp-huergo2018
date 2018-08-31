var socket = io();

/*
 Esto se usa para enviar
	socket.emit('event_name', { my: 'data' });
 
 Y esto para recibir
	socket.on('event_name', function (data) {
		var my = data.my;
	});
*/

socket.on('serial', function (data) {
	$(".serie-rows").append('<div class="row '+(data.direction == 'sended' ? 'sale' : 'entra')+'"><i class="material-icons">arrow_'+(data.direction == 'sended' ? 'back' : 'forward')+'</i>'+data.data+'</div>');
	$("#serial_information").stop().animate({ scrollTop: $('#serial_information').prop("scrollHeight")}, 400);
});

socket.on('estado', function (placas_estados) {
	for(var id in placas_estados) {
		$("#cochera-" + id).toggleClass('libre', placas_estados[id]);
	}
});

function generarCocherasLinea(x_off, y_off, start) {
	var id = start;
	var dist = 0;
	for(var i = 3; i >= 0; i--) {
		var y = i * 33.8;
		$(".plano").append('<div class="cochera" data-id="' + id + '" id="cochera-' + id + '"></div>');
		var c = $(".plano .cochera:last");
		c.css('left', x_off);
		c.css('top', y + y_off);
		id++;
	}
}
function generarCocherasLado(x_off, y_off, start) {
	var id = start;
	var cocheras_x = [ 0, 155, 270, 425, 540 ];
	cocheras_x.forEach(function(x) {
		generarCocherasLinea(x + x_off, y_off, id);
		id += 4;
	});
}
function generarCocheras() {
	$(".plano").html('');
	var start = 200;
	generarCocherasLado(164.4,144.3, start);
	generarCocherasLado(164.4,420.3, start + 20);

}

generarCocheras();

$(".cochera").click(function() {
	var id = $(this).data("id");
	
});
$("#serial-send").click(function() {
	socket.emit('serial', { id: $("#serial-id").val(), dato: $("#serial-dato").val()});
});