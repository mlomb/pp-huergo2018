const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const mysql = require('mysql');
const url = require("url");
const mp = require('mercadopago');
const moment = require('moment');
const randomstring = require("randomstring");


var datos = require('./../datos.json');

mp.configure({
    client_id: '7287645047868069',
    client_secret: 'poJoEQDD3lcMggBGL93Bj9jbQit75Q4E'
});

admin.initializeApp({
  credential: admin.credential.cert(datos.firebase)
});

var con = mysql.createPool(datos.database);

function doQuery(query, params, callback) {
    con.getConnection(function(err, connection) {
        if(err) throw err;
        connection.query(query, params, function(err, results) {
            connection.release();
            if(err) throw err;
            callback(results);
        });
    });
}

const admin_auth = admin.auth();
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/", express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');

function checkLogin(req, pred) {
    var data = {
        login: false,
        user: null
    };
    const sessionCookie = req.cookies.session || "";

    if(sessionCookie.length == 0) {
        pred(data);
        return;
    }

    admin_auth.verifySessionCookie(sessionCookie, false).then((decodedClaims) => {
        
        data.login = true;
        data.user = {
            user_id: decodedClaims.user_id,
            name: decodedClaims.name,
            picture: decodedClaims.picture
        };
        pred(data);
    }).catch(error => {
        console.log("Error verifying cookie: " + error);
        pred(data);
    });
}

app.get('/', function(req,res){
    doQuery("SELECT count(id) FROM slots WHERE state = 'LIBRE'", [] , function (result) {
        checkLogin(req, function(data) {
            data.cocheras = result[0]["count(id)"];
            res.render('index', data);
        });
    });
});

app.get('/app', function(req,res){
    res.render('app');
});

app.get('/api/logout', function(req,res){
    res.clearCookie('session');
    res.redirect('/');
});

app.post('/api/login', function(req,res){
    var idToken = req.body.token;

    admin.auth().verifyIdToken(idToken).then(function(decodedToken) {
        //console.log(decodedToken);
        var uid = decodedToken.uid;
        var name = decodedToken.name;
        var email = decodedToken.email;
        
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly: true, secure: false};
            res.cookie('session', sessionCookie, options);
            doQuery("INSERT IGNORE INTO users_app (id,nombre,email,password) VALUES (?,?,?,'')", [uid,name,email] , function (result) {
                console.log("Usuario inició sesión: " + uid);
                res.end(JSON.stringify({ success: true }));
            });
        }).catch(function(error) {
            res.end(JSON.stringify({ success: false }));
        });
    }).catch(function(error) {
        res.end(JSON.stringify({ success: false }));
    });
});

function getMPUrl(preference, callback){
    mp.preferences.create(preference).then(function (preference) {
        callback(preference);
    }).catch(function (error) {
        console.log(error);
        callback(null);
    });
}

function checkAvailable(query, callback){
    doQuery(query, [] , function (result) {
        callback(result);
    });
}

app.post('/api/pay', function(req,res){
    var obj = new Object();
    obj.status = 0;
    obj.data  = "";
    var salida = req.body.formSalida;
    var slot = req.body.formSlot;
    var tiempo = salida.split(":");

    checkLogin(req, function(userData) {
        if(userData.login == false){
            obj.data = "Necesita iniciar sesión primero!";
            var jsonObj= JSON.stringify(obj);
            res.write(jsonObj);
            res.end();
            return;
        }else{
            //CHEQUEO DE TIEMPO
            if( tiempo[0] < 00 || tiempo[0] > 24 || tiempo[1] < 00 || tiempo[1] > 60 || (tiempo[0] == 00 && tiempo[1] == 00)){
                obj.data = "Error con la selección de horas";
                var jsonObj= JSON.stringify(obj);
                res.write(jsonObj);
                res.end();
                return;
            }else{
                var tiempoPedido = tiempo[0] * 2;
                if(tiempo[1] != 00){
                    if(tiempo[1] > 30){
                        tiempoPedido+= 2;
                    }else{
                        tiempoPedido+= 1;
                    }
                }
                var entrada = moment().format('YYYY-MM-DD HH-mm-ss');
                var salida = moment().add(tiempo[0], 'hours').add(tiempo[1], 'minutes').format('YYYY-MM-DD HH-mm-ss'); 
                console.log("Entrada" + entrada + " | Salida : "+ salida); 
            }
            
            
            
            //DISTINTOS TIPOS DE ESTACIONAMIENTOS
            var querys = {Normal : "SELECT * FROM slots WHERE id NOT IN (200,201,202,203,204,205,206,207,220,221,222,223,224,225,226,227) AND state = 'LIBRE'" , 
                        Discapacitado : "SELECT * FROM slots WHERE id IN (200,201,202,203,220,221,222,223) AND state = 'LIBRE'",
                        Premium : "SELECT * FROM slots WHERE id NOT IN (204,205,206,207,224,225,226,227) AND state = 'LIBRE'" }
            var precios = {Normal : 50 , 
                        Discapacitado : 40,
                        Premium : 60 }
            
            try{    
                checkAvailable(querys[slot], function(result){
                    if(result.length == 0){
                        obj.data = "No hay lugares disponibles para reservar en este momento. Por favor vuelva a intentar mas tarde.";
                        var jsonObj= JSON.stringify(obj);
                        res.write(jsonObj);
                        res.end();
                    }else{
                        var mediaHora = precios[slot];
                        //var precio = mediaHora * tiempoPedido;
                        var precio = 1;
                        var preference = {
                            items: [
                            item = {
                                title: 'Estacionamiento ' + slot,
                                quantity: 1,
                                currency_id: 'ARS',
                                unit_price: precio
                            }
                            ],
                        };
                        getMPUrl(preference, function(preference) {
                            obj.status = 1;
                            obj.data = preference.body.init_point;
                            var id = preference.body.id;
                            //console.log("Preference : " +JSON.stringify(preference));
                            var jsonObj= JSON.stringify(obj);

                            var code = randomstring.generate(7);
                            doQuery("INSERT INTO reservas (id,id_cliente,id_pago,patente,codigo,entrada,salida,slot,pagado) VALUES ('',?,?,'',?,?,?,?,0)", [userData.user.user_id,id,code,entrada,salida,result[0].id] , function (result) {
                                res.write(jsonObj);
                                res.end();
                            });
                        });
                    }
                })
            }catch(e){
                obj.data = "Ha ocurrido un error del lado del servidor";
                var jsonObj= JSON.stringify(obj);
                res.write(jsonObj);
                res.end();
            }
        }
    });
});

app.post('/mercadopago', function(req,res){
    res.writeHead(200);
	res.end();
	
	var params = url.parse(req.url, true).query;
    
    var topic = params.topic;

    switch (topic) {
        case "payment":
            mp.get("/v1/payments/"+params.id).
                then (function (payment_info) {
                    mp.get ("/merchant_orders/"+payment_info.response.order.id)
                        .then (processMerchantOrder);
                });
        break;
        case "merchant_order":
            mp.get ("/merchant_orders/"+params.id)
                .then (processMerchantOrder);
        break;

        default:
            processMerchantOrder (null);
    }

    function processMerchantOrder (merchant_order_info) {
        if (merchant_order_info == null) {
            throw "Error obtaining the merchant_order";
        }

        if (merchant_order_info.status == 200) {
            var paid_amount = 0;

            merchant_order_info["response"]["payments"].forEach(function(payment){
                if (payment['status'] == 'approved'){
                    paid_amount += payment['transaction_amount'];
                }
            })
            console.log(merchant_order_info);
            if(paid_amount >= merchant_order_info["response"]["total_amount"]){
                if(merchant_order_info["response"]["shipments"].length > 0) { // The merchant_order has shipments
                    if(merchant_order_info["response"]["shipments"][0]["status"] == "ready_to_ship"){
                        doQuery("SELECT * FROM reservas WHERE id_pago = ? ;", [merchant_order_info["response"]["preference_id"]] , function (result) {
                            var mail = result[0]['email'];
                            if(result[0]['pagado'] == 0){
                                doQuery("UPDATE reservas SET pagado = 1 WHERE id_pago = ? ;", [merchant_order_info["response"]["preference_id"]] , function (result) {
                                    //TODO OK
                                });
                            }
                        });
                    }
                } else { // The merchant_order don't has any shipments
                    doQuery("SELECT * FROM reservas WHERE id_pago = ? ;", [merchant_order_info["response"]["preference_id"]] , function (result) {
                        var mail = result[0]['email'];
                        if(result[0]['pagado'] == 0){
                            doQuery("UPDATE reservas SET pagado = 1 WHERE id_pago = ? ;", [merchant_order_info["response"]["preference_id"]] , function (result) {
                                //TODO OK
                            });
                        }
                    });
                }
            } else {
                //SIN PAGAR
                console.log("No pago");
            }
        }
    }
});

app.listen(8080, function(){
    console.log('Server started on port 8080');
});
