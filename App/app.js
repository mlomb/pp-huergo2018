const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');

var serviceAccount = require('./tutu-parking-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

//PARSER PARA POST
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//TEMPLATE ENGINE
app.use("/public", express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');


//ROUTING
app.get('/', function(req,res){
    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
        res.render('index', { user: decodedClaims });
    }).catch(error => {
        res.render('index', { user: null });
    });
});

app.get('/login', function(req,res){
    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
        res.header(302, 
            {'Location': 'profile'}
        );
    }).catch(error => {
        res.render('login', { user: null });
    });
});

app.get('/register', function(req,res){
    const sessionCookie = req.cookies.session || "";
    admin.auth().verifySessionCookie(sessionCookie, true).then((decodedClaims) => {
        res.header(302, 
            {'Location': 'profile'}
        );
    }).catch(error => {
        res.render('register', { user: null });
    });
});

app.get('/logout', function(req,res){
    res.clearCookie('session');
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
            console.log("Cookie creada = " + uid);
            res.end();
        }, error => {;
            res.end();
        });
    }).catch(function(error) {
        res.end();
    });
});

app.listen(8080, function(){
    console.log('Server started on port 8080');
});