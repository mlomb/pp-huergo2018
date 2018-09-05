const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');

var datos = require('./datos.json');

admin.initializeApp({
  credential: admin.credential.cert(datos.firebase)
});

const admin_auth = admin.auth();
const app = express();

//PARSER PARA POST
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//TEMPLATE ENGINE
app.use("/public", express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');

function checkLogin(req, pred) {
    var data = {
        login: false,
        user: null
    };
    const sessionCookie = req.cookies.session || "";
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

app.get('/login', function(req,res){
    checkLogin(req, function(data) {
        if(!data.login) {
            res.render('login', data);
        } else {
            res.redirect('/');
        }
    });
});

app.get('/logout', function(req,res){
    res.clearCookie('session');
    console.log("Cookie destruida");
    res.writeHead(302, 
        {'Location': '/'}
    );
    res.end();
});

app.post('/api/login', function(req,res){
    var idToken = req.body.token;

    admin.auth().verifyIdToken(idToken).then(function(decodedToken) {
        var uid = decodedToken.uid;
        
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly: true, secure: false};
            res.cookie('session', sessionCookie, options);
            console.log("Usuario inició sesión: " + uid);
            res.end();
        }).catch(function(error) {
            res.end();
        });
    }).catch(function(error) {
        res.end();
    });
});

app.listen(8080, function(){
    console.log('Server started on port 8080');
});