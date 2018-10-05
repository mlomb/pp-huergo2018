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

app.post('/api/pay', function(req,res){
    var entrada = req.body.formEntrada;
    var salida = req.body.formSalida;
    var slot = req.body.formSlot;

    var precio = 120;
    switch(slot){
        case "Normal":

        break;
        case "Discapacitado":

        break;
        case "Premium":

        break;
        
    }

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
     
    mp.preferences.create(preference).then(function (preference) {
        console.log(preference.body.init_point);
        res.redirect(preference.body.init_point);
        res.end();
    }).catch(function (error) {
        console.log(error);
    });

    console.log("ASDASDW");
});

app.listen(8081, function(){
    console.log('Server started on port 8081');
});