
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
function generarEstacionamiento() {
	$(".plano").html('');
	var start = 200;
	generarCocherasLado(164.4,144.3, start);
	generarCocherasLado(164.4,420.3, start + 20);
	
	var utilities = [
		{ x: 260, y: 10, id: 160, rotate: 0 },
		{ x: 583, y: 10, id: 161, rotate: 0 },
		
		{ x: 853, y: 200, id: 162, rotate: 90 },
		{ x: 853, y: 480, id: 163, rotate: 90 },
		
		{ x: 260, y: 648, id: 164, rotate: 0 },
		{ x: 583, y: 648, id: 165, rotate: 0 },
	];
	
	for(var utils of utilities) {
		$(".plano").append(`
			<div style="left:` + utils.x + `px;top:` + utils.y + `px;` + (utils.rotate != 0 ? 'transform:rotate('+utils.rotate+'deg)' : '') + `" data-id="` + utils.id + `" class="utilities">
				<div class="bulb"></div>
				<div class="fan-border">
					<div class="fan"></div>
				</div>
			</div>
		`);
	}
	
	$(".bulb").click(function() {
		var id = $(this).parent().data("id");
		socket.emit('bulb', { id: id });
	});
	
	$(".fan").click(function() {
		var id = $(this).parent().parent().data("id");
		socket.emit('fan', { id: id });
	});
	
	$(".allBulbs").click(function() {
		socket.emit('bulbs', $(this).data("active"));
	});
	
	$(".allFans").click(function() {
		socket.emit('fans', $(this).data("active"));
	});
	
	
	$("#stop-panic").click(function() {
		socket.emit('stop_panic', {});
		$(".panic-modal").removeClass("active");
		$(".panico").removeClass("active");
	});
}

generarEstacionamiento();


var socket = io();

/*
 Esto se usa para enviar
	socket.emit('event_name', { my: 'data' });
 
 Y esto para recibir
	socket.on('event_name', function (data) {
		var my = data.my;
	});
*/

socket.on('alert', function (data) {
	alert(data);
});

socket.on('input_patente', function (data) {
	var result = prompt("Un auto ingresó y no se reconoció la patente. Por favor ingresar a mano: (ENTER para cancelar)");
	if(result.length == 0) {
		//
	} else {
		data.patente = result;
		socket.emit('input_patente_resultado', data);
	}
});

socket.on('serial', function (data) {
	$(".serie-rows").append('<div class="row '+(data.direction == 'sended' ? 'sale' : 'entra')+'"><i class="material-icons">arrow_'+(data.direction == 'sended' ? 'back' : 'forward')+'</i>'+data.data+'</div>');
	if($(".serie-rows .row").length > 200)
		$(".serie-rows .row").slice(0, 1).remove();
	$("#serial_information").stop().animate({ scrollTop: $('#serial_information').prop("scrollHeight")}, 400);
});

socket.on('estado', function (placas_estados) {
	for(var id in placas_estados) {
		$("#cochera-" + id).toggleClass('libre', placas_estados[id]);
	}
});

socket.on('displays', function (displays) {
	$("#displays-container").html("");
	for(var display_id in	 displays) {
		$("#displays-container").append(`
			<div data-id="` + display_id + `">
				Display #` + display_id + `
				<br>
				<div class="mdl-textfield mdl-js-textfield">
					<input class="mdl-textfield__input" type="text">
				</div>
				<button class="display-update mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">Modificar</button>
				<div class="display-sample"></div>
			</div>
		`);
		$('div[data-id="' + display_id + '"] input').val(displays[display_id]);
		//$('div[data-id="' + display_id + '"] .display-sample').html(displays[display_id]);
	}
	$(".display-update").click(function() {
		var id = $(this).parent().data("id");
		var txt = $(this).parent().find("input").val();
		socket.emit('update_display', { id: id, text: txt });
		//$('div[data-id="' + display_id + '"] .display-sample').html(txt);
	});
});

socket.on('utilities', function (utilities) {
	for(var u_id in utilities) {
		var a = $('.utilities[data-id="' + u_id + '"]');
		a.children(".bulb").toggleClass("on", utilities[u_id]["bulb"]);
		a.children(".fan-border").children(".fan").toggleClass("on", utilities[u_id]["fan"]);
	}
});
	
socket.on('panico', function (panico) {
	if(panico.id == 0) {
		
	}
});

$(".cochera").click(function() {
	var id = $(this).data("id");
	
});
setInterval(function() {
	$.ajax({
		url: "/actualClients",
		dataType: 'json',
		success: function(result){
			$('.table-cont table tbody').html("");
			for(var client of result){
				$('.table-cont table tbody').append(`
				<tr>
					<td>`+client.patente+`</td>
					<td><a href=`+client.img_patente+` target="_blank"><img src="`+client.img_patente+`" alt=""></a></td>
					<td>`+client.slot+`</td>
					<td>`+new Date(client.llegada).toLocaleTimeString()+`</td>
					<td>`+new Date(client.salida).toLocaleTimeString()+`</td>
				 </tr>
				`);
			}
		}
    });
}, 1000);



$("#serial-send").click(function() {
	socket.emit('serial', { id: $("#serial-id").val(), dato: $("#serial-dato").val()});
});