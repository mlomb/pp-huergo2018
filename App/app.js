const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const mysql = require('mysql');

var datos = require('./../datos.json');

admin.initializeApp({
  credential: admin.credential.cert(datos.firebase)
});

var con = mysql.createPool(datos.database);

function doQuery(query, params, callback) {
    pool.getConnection(function(err, connection) {
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

//PARSER PARA POST
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//TEMPLATE ENGINE
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
    checkLogin(req, function(data) {
        res.render('index', data);
    });
});

app.get('/profile', function(req,res){
    checkLogin(req, function(data) {
        res.render('profile', data);
    });
});

app.get('/home', function(req,res){
    checkLogin(req, function(data) {
        res.render('home', data);
    });
});

app.get('/login', function(req,res){
    checkLogin(req, function(data) {
        if(!data.login) {
            res.render('login', data);
        } else {
            res.redirect('/');
        }
    });
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

app.listen(8080, function(){
    console.log('Server started on port 8080');
});