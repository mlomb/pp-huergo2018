const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

//PARSER PARA POST
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true}));
//TEMPLATE ENGINE
app.use("/public", express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');
//SESSION (PARA QUE CARAJO ES EL SECRETO?)
app.use(session({secret: "Shh, its a secret!"})); 

//ROUTING
app.get('/', function(req,res){
    res.render('index');
});
app.get('/login', function(req,res){
    res.render('login');
});
app.post('/login', function(req,res){
    var con = mysql.createConnection({
        host: "nyvaweb.com",
        user: "nyvaespo_tutu",
        password: "supertutuparking",
        database: "nyvaespo_tutu"
    });

    con.query({
        sql: 'SELECT * FROM users WHERE usuario = ? AND password = ?',
        timeout: 4000, // 4s
        values: [req.body.user,req.body.pass]
    }, function (error, results, fields) {
        if (error) throw error;
        if (results !== undefined && results.length > 0){
            res.send(results + " <br> Todo ok wacho -> " + req.session.id + " | ID : " + fields[0].id);
            //INICIA LA SESSION CAPO
        }else{
            res.send("Error capo");
            //TIRAR EL MENSAJITO DE ERROR (Y UN PASO)
        }
    });
});

app.listen(8080, function(){
    console.log('Server started on port 8080');
});