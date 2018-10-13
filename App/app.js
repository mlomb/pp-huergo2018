const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const mysql = require('mysql');
const mp = require('mercadopago');

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
        var uid = decodedToken.uid;
        
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly: true, secure: false};
            res.cookie('session', sessionCookie, options);
            doQuery("INSERT IGNORE INTO users (id) VALUES (?)", [uid] , function (result) {
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
        callback(preference.body.init_point);
    }).catch(function (error) {
        console.log(error);
        callback(null);
    });
}

app.post('/api/pay', function(req,res){
    //CHEQUEAR SI ESTA LOGUEADO
    var obj = new Object();
    obj.status = 0;
    obj.data  = "";
    var salida = req.body.formSalida;
    var slot = req.body.formSlot;

    var tiempo = salida.split(":");
    if( tiempo[0] < 00 || tiempo[0] > 24 || tiempo[1] < 00 || tiempo[1] > 60 || (tiempo[0] == 00 && tiempo[1] == 00)){
        obj.data = "Error con la selección de horas";
        var jsonObj= JSON.stringify(obj);
        res.write(jsonObj);
        res.end();
        return;
    }
    var tiempoPedido = tiempo[0] * 2;
    if(tiempo[1] != 00){
        if(tiempo[1] > 30){
            tiempoPedido+= 2;
        }else{
            tiempoPedido+= 1;
        }
    }
    
    switch(slot){
        case "Normal":
            var mediaHora = 50;
        break;
        case "Discapacitado":
            var mediaHora = 40;
        break;
        case "Premium":
            var mediaHora = 60;
        break;
    }
    var precio = mediaHora * tiempoPedido;

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
     
    getMPUrl(preference, function(url) {
        obj.status = 1;
        obj.data = url;   
        var jsonObj= JSON.stringify(obj);
        res.write(jsonObj);
        res.end();
    });


});

app.post('/mercadopago', function(req,res){
    //TOCAR ACA
    res.writeHead(200);
    res.end(index);

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
            console.log (merchant_order_info.response.payments);
            console.log (merchant_order_info.response.shipments);
        }
    }
});

app.listen(8080, function(){
    console.log('Server started on port 8080');
});
